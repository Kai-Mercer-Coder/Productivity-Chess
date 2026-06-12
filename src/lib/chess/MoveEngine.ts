import { Chess } from 'chess.js';
import type { MoveEngine } from '@/lib/types/Engine';


/**
 * Base class for engines using a Stockfish worker.
 */
abstract class BaseStockfishEngine {
    protected worker: Worker | null = null;
    protected isReady = false;

    constructor(workerPath: string) {
        try {
            this.worker = new Worker(workerPath);
            this.worker.onmessage = this.handleMessage.bind(this);
            this.postCommand('uci');
        } catch (error) {
            console.error(`❌ Failed to load Stockfish worker at ${workerPath}:`, error);
        }
    }

    protected abstract handleMessage(event: MessageEvent): void;

    protected postCommand(command: string) {
        if (this.worker) {
            this.worker.postMessage(command);
        } else {
            console.error('Stockfish worker not initialized');
        }
    }

    public terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            this.isReady = false;
        }
    }
}

export class StockfishEngine extends BaseStockfishEngine implements MoveEngine {
    private bestMove: string | null = null;
    private moveResolver: ((move: string | null) => void) | null = null;
    private elo: number;

    constructor(stockfishPath = './stockfish-18-lite-single.js', elo = 1350) {
        super(stockfishPath);
        this.elo = elo;
    }

    protected handleMessage(event: MessageEvent) {
        const message = event.data;

        if (message === 'uciok') {
            this.isReady = true;
            this.updateConfiguration();
        }

        if (message === 'readyok') {
            this.isReady = true;
        }

        if (message.startsWith('bestmove')) {
            const parts = message.split(' ');
            this.bestMove = parts[1] || null;
            if (this.moveResolver) {
                this.moveResolver(this.bestMove);
                this.moveResolver = null;
            }
        }
    }

    private updateConfiguration() {
        this.postCommand('setoption name UCI_LimitStrength value true');
        this.postCommand(`setoption name UCI_Elo value ${Math.max(1350, Math.min(3190, this.elo))}`);
    }

    async getNextMove(chessGame: Chess): Promise<string | null> {
        if (!this.worker || chessGame.isGameOver()) return null;

        const moves = chessGame.moves({ verbose: true });
        if (moves.length === 0) return null;
        if (moves.length === 1) return moves[0].san;

        return new Promise((resolve) => {
            this.moveResolver = resolve;
            this.bestMove = null;
            let tme = Math.ceil(Math.random() * 5000)

            this.postCommand(`position fen ${chessGame.fen()}`);
            this.postCommand(`go movetime ${tme}`); // 1 second
            console.log(`${tme}`)



        });
    }

    setElo(elo: number) {
        this.elo = Math.max(250, Math.min(3190, elo));
        this.updateConfiguration();
    }

    getElo(): number {
        return this.elo;
    }
}

export interface ChessApiResponse {
    bestmove: string;
    san: string;
    text: string;
    eval: number;
    mate: number | null;
    continuationArr: string[];
    winChance: number;
    [key: string]: any;
}

export class ChessApiEvalEngine {
    private onEvalUpdate: (evaluation: number, fen: string, data: ChessApiResponse, mate?: number) => void;
    private abortController: AbortController | null = null;

    constructor(onEvalUpdate: (evaluation: number, fen: string, data: ChessApiResponse, mate?: number) => void) {
        this.onEvalUpdate = onEvalUpdate;
    }

    public async evaluatePosition(fen: string) {
        if (this.abortController) this.abortController.abort();
        this.abortController = new AbortController();

        try {
            const response = await fetch("https://chess-api.com/v1", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fen,
                    depth: 17
                }),

                signal: this.abortController.signal
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data: ChessApiResponse = await response.json();

            if (data.eval !== undefined) {
                const evalNum = parseFloat(data.eval as any);
                const mate = data.mate ?? undefined;
                console.log(data)

                this.onEvalUpdate(evalNum, fen, data, mate);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.error('❌ Chess API Error:', error);
        }
    }


    public terminate() {
        if (this.abortController) this.abortController.abort();
    }
}

const HF_BASE = "https://clonicalcloner-aasopd-stockfish-depth-18.hf.space";
const HF_HEADERS = { "Authorization": `Bearer ${process.env.HF_TOKEN}`, "Content-Type": "application/json" };

export interface HFApiResponse {
    success?: boolean;
    best_move?: string;
    depth_reached?: number;
    score?: { type?: string; value?: number };
    [key: string]: any;
}

export class HuggingFaceEvalEngine {
    private onEvalUpdate: (evaluation: number, fen: string, data: HFApiResponse, mate?: number) => void;
    private abortController: AbortController | null = null;

    constructor(onEvalUpdate: (evaluation: number, fen: string, data: HFApiResponse, mate?: number) => void) {
        this.onEvalUpdate = onEvalUpdate;
    }

    public async evaluatePosition(fen: string) {
        if (this.abortController) this.abortController.abort();
        this.abortController = new AbortController();

        try {
            const lichessEval = await tryLichessCloudEval(fen);
            if (lichessEval) {
                this.onEvalUpdate(lichessEval.eval, fen, {
                    success: true,
                    best_move: lichessEval.bestmove,
                    score: { type: "centipawns", value: Math.round(lichessEval.eval * 100) },
                }, lichessEval.mate ?? undefined);
                return;
            }

            if (Math.random() < 0.4) {
                const response = await fetch(`${HF_BASE}/evaluate`, {
                    method: "POST",
                    headers: HF_HEADERS,
                    body: JSON.stringify({ fen, depth: 18 }),
                    signal: this.abortController.signal
                });

                if (!response.ok) throw new Error(`HF API error: ${response.status}`);

                const data: HFApiResponse = await response.json();
                const cp = data.score?.value ?? 0;
                this.onEvalUpdate(cp / 100, fen, data, undefined);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.error('❌ HuggingFace API Error:', error);
        }
    }

    public terminate() {
        if (this.abortController) this.abortController.abort();
    }
}

export interface LocalEvalResult {
    fen: string;
    eval: number;
    mate: number | null;
    bestmove: string;
    depth: number;
}

export class LocalStockfishEvalEngine {
    private worker: Worker | null = null;
    private ready = false;
    private evalResolve: ((result: LocalEvalResult) => void) | null = null;
    private currentFen = "";

    constructor() {
        try {
            this.worker = new Worker("/stockfish/stockfish-18-lite-single.js");
            this.worker.onmessage = this.handleMessage.bind(this);
        } catch (err) {
            console.error("Failed to load local Stockfish:", err);
        }
    }

    private handleMessage(e: MessageEvent) {
        const msg = e.data as string;
        if (!msg) return;

        if (msg === "uciok" && !this.ready) {
            this.ready = true;
            this.worker?.postMessage("isready");
            return;
        }

        if (msg === "readyok") {
            this.ready = true;
            return;
        }

        let bestCp = 0;
        let bestMate: number | null = null;
        let bestDepth = 0;
        let bestMove = "";

        if (msg.startsWith("info")) {
            const parts = msg.split(" ");
            for (let i = 0; i < parts.length; i++) {
                if (parts[i] === "depth" && i + 1 < parts.length) {
                    bestDepth = Math.max(bestDepth, parseInt(parts[i + 1], 10) || 0);
                }
                if (parts[i] === "score" && i + 2 < parts.length) {
                    if (parts[i + 1] === "cp" && i + 2 < parts.length) {
                        bestCp = parseInt(parts[i + 2], 10) || 0;
                        bestMate = null;
                    } else if (parts[i + 1] === "mate" && i + 2 < parts.length) {
                        bestMate = parseInt(parts[i + 2], 10) || 0;
                    }
                }
                if (parts[i] === "pv" && i + 1 < parts.length) {
                    bestMove = parts[i + 1];
                }
            }
        }

        if (msg.startsWith("bestmove")) {
            const parts = msg.split(" ");
            if (parts.length >= 2) {
                bestMove = bestMove || parts[1];
            }
            if (this.evalResolve) {
                this.evalResolve({
                    fen: this.currentFen,
                    eval: bestMate !== null ? (bestMate > 0 ? 100 : -100) : bestCp / 100,
                    mate: bestMate,
                    bestmove: bestMove,
                    depth: bestDepth,
                });
                this.evalResolve = null;
            }
        }
    }

    async evaluatePosition(fen: string, timeMs = 5000): Promise<LocalEvalResult> {
        if (!this.worker || !this.ready) {
            return { fen, eval: 0, mate: null, bestmove: "", depth: 0 };
        }

        this.currentFen = fen;
        return new Promise((resolve) => {
            this.evalResolve = resolve;
            this.worker?.postMessage("position fen " + fen);
            this.worker?.postMessage("go movetime " + timeMs);
        });
    }

    async evaluatePositions(
        fens: { fen: string; index: number }[],
        timeMs = 3000,
        onResult?: (result: LocalEvalResult, index: number) => void
    ): Promise<LocalEvalResult[]> {
        const results: LocalEvalResult[] = [];
        for (const { fen, index } of fens) {
            const result = await this.evaluatePosition(fen, timeMs);
            result.fen = fen;
            results.push(result);
            onResult?.(result, index);
        }
        return results;
    }

    terminate() {
        this.worker?.terminate();
        this.worker = null;
        this.ready = false;
    }
}

export async function hfEvaluateFen(fen: string): Promise<{
    eval: number;
    mate: number | null;
    bestmove: string;
    san: string;
    continuationArr: string[];
    winChance: number;
}> {
    const lichessEval = await tryLichessCloudEval(fen);
    if (lichessEval) return lichessEval;

    if (Math.random() < 0.4) {
        const response = await fetch(`${HF_BASE}/evaluate`, {
            method: "POST",
            headers: HF_HEADERS,
            body: JSON.stringify({ fen, depth: 18 }),
        });

        if (!response.ok) throw new Error(`HF API error: ${response.status}`);

        const data = await response.json();
        const cp = data.score?.value ?? 0;
        return {
            eval: cp / 100,
            mate: null,
            bestmove: data.best_move ?? "",
            san: "",
            continuationArr: [],
            winChance: 50 + (cp / 200),
        };
    }

    return {
        eval: 0,
        mate: null,
        bestmove: "",
        san: "",
        continuationArr: [],
        winChance: 50,
    };
}

async function tryLichessCloudEval(fen: string): Promise<{
    eval: number;
    mate: number | null;
    bestmove: string;
    san: string;
    continuationArr: string[];
    winChance: number;
} | null> {
    try {
        const encoded = encodeURIComponent(fen);
        const response = await fetch(`https://lichess.org/api/cloud-eval?fen=${encoded}`, {
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) return null;

        const data = await response.json();
        if (!data || data.depth === 0 || !data.pvs?.length) return null;

        const pv = data.pvs[0];
        const cp = pv.cp ?? 0;
        const mate = pv.mate ?? null;
        const moves = pv.moves?.split(" ") ?? [];
        const bestmove = moves[0] ?? "";

        return {
            eval: mate !== null ? (mate > 0 ? 100 : -100) : cp / 100,
            mate,
            bestmove,
            san: "",
            continuationArr: moves.slice(1),
            winChance: 50 + (cp / 200),
        };
    } catch {
        return null;
    }
}
