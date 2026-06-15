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

    constructor(stockfishPath = '/stockfish/stockfish-18-lite-single.js', elo = 1350) {
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
        this.postCommand(`setoption name UCI_Elo value ${Math.max(250, Math.min(3190, this.elo))}`);
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

        // 0. Try tablebase first (≤7 pieces, instant perfect play)
        const tb = await fetchTablebase(fen);
        if (tb) {
            this.onEvalUpdate(tb.eval, fen, {
                bestmove: tb.bestmove,
                san: "",
                text: "",
                eval: tb.eval,
                mate: tb.mate,
                continuationArr: [],
                winChance: tb.winChance,
            }, tb.mate ?? undefined);
            return;
        }

        // 1. Try ChessDB (fast, free)
        const chessDb = await fetchChessDbEval(fen);
        if (chessDb) {
            this.onEvalUpdate(chessDb.eval, fen, {
                bestmove: chessDb.bestmove,
                san: "",
                text: "",
                eval: chessDb.eval,
                mate: chessDb.mate,
                continuationArr: chessDb.continuationArr,
                winChance: chessDb.winChance,
            }, chessDb.mate ?? undefined);
            return;
        }

        // 2. Fallback to chess-api.com
        try {
            const response = await fetch("https://chess-api.com/v1", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fen, depth: 18 }),
                signal: this.abortController.signal,
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data: ChessApiResponse = await response.json();

            if (data.eval !== undefined) {
                const evalNum = parseFloat(data.eval as any);
                const mate = data.mate ?? undefined;
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
            const tb = await fetchTablebase(fen);
            if (tb) {
                this.onEvalUpdate(tb.eval, fen, {
                    success: true,
                    best_move: tb.bestmove,
                    score: { type: "centipawns", value: Math.round(tb.eval * 100) },
                }, tb.mate ?? undefined);
                return;
            }

            const lichessEval = await tryLichessCloudEval(fen);
            if (lichessEval) {
                this.onEvalUpdate(lichessEval.eval, fen, {
                    success: true,
                    best_move: lichessEval.bestmove,
                    score: { type: "centipawns", value: Math.round(lichessEval.eval * 100) },
                }, lichessEval.mate ?? undefined);
                return;
            }

            const chessDb = await fetchChessDbEval(fen);
            if (chessDb) {
                this.onEvalUpdate(chessDb.eval, fen, {
                    success: true,
                    best_move: chessDb.bestmove,
                    score: { type: "centipawns", value: Math.round(chessDb.eval * 100) },
                }, chessDb.mate ?? undefined);
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
    pv: string[];
    multiPv: { eval: number; mate: number | null; pv: string[]; depth: number }[];
}

export class LocalStockfishEvalEngine {
    private worker: Worker | null = null;
    private ready = false;
    private evalResolve: ((result: LocalEvalResult) => void) | null = null;
    private evalUpdate: ((result: LocalEvalResult) => void) | null = null;
    private currentFen = "";
    private multiPvCount = 1;
    private maxDepth = 18;
    private minReportDepth = 8;
    private lines: Map<number, { eval: number; mate: number | null; pv: string[]; depth: number }> = new Map();
    private lastCp = 0;
    private lastMate: number | null = null;
    private lastDepth = 0;
    private lastPv: string[] = [];
    private restartBackoff = 0;

    constructor() {
        this.startWorker();
    }

    private startWorker() {
        try {
            this.restartBackoff = Math.min(this.restartBackoff + 1, 5);
            this.worker?.terminate();
            this.ready = false;
            this.worker = new Worker("/stockfish/stockfish-18-lite-single.js");
            this.worker.onmessage = this.handleMessage.bind(this);
            this.worker.onerror = (ev) => {
                const msg = ev.message || ev.error?.message || "unknown";
                console.error("Stockfish worker error:", msg);
                if (this.restartBackoff < 5) {
                    setTimeout(() => this.startWorker(), this.restartBackoff * 2000);
                }
            };
            this.worker.postMessage("uci");
        } catch (err) {
            console.error("Failed to load local Stockfish:", err);
        }
    }

    setMultiPV(n: number) {
        this.multiPvCount = Math.max(1, Math.min(10, n));
        if (this.ready) {
            this.worker?.postMessage("setoption name MultiPV value " + this.multiPvCount);
        }
    }

    setMaxDepth(d: number) {
        this.maxDepth = d;
    }

    private report() {
        if (!this.evalUpdate) return;
        const sorted = Array.from(this.lines.entries())
            .sort(([a], [b]) => a - b)
            .map(([, v]) => v);
        this.evalUpdate({
            fen: this.currentFen,
            eval: this.lastMate !== null ? (this.lastMate > 0 ? 100 : -100) : this.lastCp / 100,
            mate: this.lastMate,
            bestmove: this.lastPv[0] ?? "",
            depth: this.lastDepth,
            pv: this.lastPv,
            multiPv: sorted,
        });
    }

    private handleMessage(e: MessageEvent) {
        const msg = e.data as string;
        if (!msg) return;

        if (msg === "uciok" && !this.ready) {
            this.ready = true;
            this.worker?.postMessage("setoption name MultiPV value " + this.multiPvCount);
            this.worker?.postMessage("isready");
            return;
        }

        if (msg === "readyok") {
            this.ready = true;
            this.restartBackoff = 0;
            return;
        }

        if (msg.startsWith("info")) {
            const parts = msg.split(" ");
            let cp = 0;
            let mate: number | null = null;
            let depth = 0;
            let pvLine: string[] = [];
            let multiPvIndex = 1;
            let hasScore = false;

            for (let i = 0; i < parts.length; i++) {
                if (parts[i] === "multipv" && i + 1 < parts.length) {
                    multiPvIndex = parseInt(parts[i + 1], 10) || 1;
                }
                if (parts[i] === "depth" && i + 1 < parts.length) {
                    depth = parseInt(parts[i + 1], 10) || 0;
                }
                if (parts[i] === "score" && i + 2 < parts.length) {
                    hasScore = true;
                    if (parts[i + 1] === "cp" && i + 2 < parts.length) {
                        cp = parseInt(parts[i + 2], 10) || 0;
                        mate = null;
                    } else if (parts[i + 1] === "mate" && i + 2 < parts.length) {
                        mate = parseInt(parts[i + 2], 10) || 0;
                    }
                }
                if (parts[i] === "pv") {
                    pvLine = parts.slice(i + 1).filter((m: string) => m.length >= 4 && m.length <= 5);
                }
            }

            if (hasScore) {
                if (multiPvIndex === 1) {
                    this.lastCp = cp;
                    this.lastMate = mate;
                    this.lastDepth = depth;
                    this.lastPv = pvLine;
                }
                this.lines.set(multiPvIndex, {
                    eval: mate !== null ? (mate > 0 ? 100 : -100) : cp / 100,
                    mate,
                    pv: pvLine,
                    depth,
                });
                if (depth >= this.minReportDepth && this.evalUpdate) {
                    this.report();
                }
                if (depth >= this.maxDepth && this.evalResolve) {
                    this.worker?.postMessage("stop");
                }
            }
        }

        if (msg.startsWith("bestmove")) {
            const parts = msg.split(" ");
            const bestMove = parts.length >= 2 ? parts[1] : "";
            const sorted = Array.from(this.lines.entries())
                .sort(([a], [b]) => a - b)
                .map(([, v]) => v);

            if (this.evalResolve) {
                this.evalResolve({
                    fen: this.currentFen,
                    eval: this.lastMate !== null ? (this.lastMate > 0 ? 100 : -100) : this.lastCp / 100,
                    mate: this.lastMate,
                    bestmove: bestMove || (this.lastPv[0] ?? ""),
                    depth: this.lastDepth,
                    pv: this.lastPv,
                    multiPv: sorted,
                });
                this.evalResolve = null;
                this.evalUpdate = null;
            }
            this.lines.clear();
        }
    }

    async evaluatePosition(fen: string, timeMs = 10000, onUpdate?: (result: LocalEvalResult) => void): Promise<LocalEvalResult> {
        if (!this.worker) {
            return { fen, eval: 0, mate: null, bestmove: "", depth: 0, pv: [], multiPv: [] };
        }
        if (!this.ready) {
            let waited = 0;
            await new Promise<void>((r) => {
                const check = () => {
                    if (this.ready || waited >= 5000) return r();
                    waited += 100;
                    setTimeout(check, 100);
                };
                check();
            });
            if (!this.ready) {
                return { fen, eval: 0, mate: null, bestmove: "", depth: 0, pv: [], multiPv: [] };
            }
        }

        this.currentFen = fen;
        this.lines.clear();
        this.evalUpdate = onUpdate ?? null;
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
        this.restartBackoff = 10;
        this.worker?.terminate();
        this.worker = null;
        this.ready = false;
    }
}

async function fetchTablebase(fen: string): Promise<{
    eval: number;
    mate: number | null;
    bestmove: string;
    continuationArr: string[];
    winChance: number;
    category: string;
} | null> {
    try {
        const encoded = encodeURIComponent(fen);
        const response = await fetch(`https://tablebase.lichess.ovh/standard?fen=${encoded}`, {
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) return null;

        const data = await response.json();
        if (!data) return null;

        if (data.category === "draw" || data.stalemate || data.insufficient_material) {
            return {
                eval: 0,
                mate: null,
                bestmove: "",
                continuationArr: [],
                winChance: 50,
                category: "draw",
            };
        }

        if (data.checkmate) {
            const side = fen.includes(" w ") ? -1 : 1;
            return {
                eval: side * 100,
                mate: 0,
                bestmove: "",
                continuationArr: [],
                winChance: side > 0 ? 100 : 0,
                category: "checkmate",
            };
        }

        const bestMove = data.moves?.find((m: any) =>
            data.category === "win"
                ? m.category === "win" && m.dtm !== null
                : m.category === "loss" && m.dtm !== null
        ) || data.moves?.[0];

        if (!bestMove || bestMove.dtm === null || bestMove.dtm === undefined) return null;

        const mateValue = data.category === "win" ? bestMove.dtm : -bestMove.dtm;
        const sign = data.category === "win" ? 1 : -1;

        return {
            eval: sign * 100,
            mate: mateValue,
            bestmove: bestMove.uci || "",
            continuationArr: [],
            winChance: data.category === "win" ? 100 : 0,
            category: data.category,
        };
    } catch {
        return null;
    }
}

async function fetchChessDbEval(fen: string): Promise<{
    eval: number;
    mate: number | null;
    bestmove: string;
    continuationArr: string[];
    winChance: number;
} | null> {
    try {
        const encoded = encodeURIComponent(fen);
        const pvResponse = await fetch(`https://www.chessdb.cn/cdb.php?action=querypv&board=${encoded}`, {
            signal: AbortSignal.timeout(5000),
        });

        if (pvResponse.ok) {
            const text = await pvResponse.text();
            if (text && !text.includes('unknown') && !text.includes('invalid')) {
                const scoreMatch = text.match(/score:(-?\d+)/);
                const pvMatch = text.match(/pv:(.+)/);
                const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
                const pv = pvMatch ? pvMatch[1].split('|') : [];
                return {
                    eval: score / 100,
                    mate: null,
                    bestmove: pv[0] || '',
                    continuationArr: pv.slice(1),
                    winChance: 50 + (score / 200),
                };
            }
        }

        const scoreResponse = await fetch(`https://www.chessdb.cn/cdb.php?action=queryscore&board=${encoded}`, {
            signal: AbortSignal.timeout(3000),
        });

        if (scoreResponse.ok) {
            const text = await scoreResponse.text();
            if (text && text.startsWith('eval:')) {
                const score = parseInt(text.replace('eval:', ''), 10);
                return {
                    eval: score / 100,
                    mate: null,
                    bestmove: '',
                    continuationArr: [],
                    winChance: 50 + (score / 200),
                };
            }
        }
    } catch { }
    return null;
}

async function fetchChessApiEval(fen: string): Promise<{
    eval: number;
    mate: number | null;
    bestmove: string;
    san: string;
    continuationArr: string[];
    winChance: number;
} | null> {
    try {
        const response = await fetch("https://chess-api.com/v1", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fen, depth: 18 }),
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) return null;

        const data: ChessApiResponse = await response.json();
        if (data.eval === undefined) return null;

        const evalNum = parseFloat(data.eval as any);
        const mate = data.mate ?? null;
        return {
            eval: mate !== null ? (mate > 0 ? 100 : -100) : evalNum,
            mate,
            bestmove: data.bestmove || "",
            san: data.san || "",
            continuationArr: data.continuationArr || [],
            winChance: data.winChance ?? 50 + (evalNum * 100 / 200),
        };
    } catch {
        return null;
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
    // 0. Try tablebase first (serial — fast and free)
    const tablebase = await fetchTablebase(fen);
    if (tablebase) {
        return {
            eval: tablebase.eval,
            mate: tablebase.mate,
            bestmove: tablebase.bestmove,
            san: "",
            continuationArr: [],
            winChance: tablebase.winChance,
        };
    }

    // 1. Fire cloud sources in parallel, take the first success
    const sources = [
        tryLichessCloudEval(fen).then(r => r ? { ...r, _source: "lichess" } : null),
        fetchChessDbEval(fen).then(r => r ? { ...r, _source: "chessdb" } : null),
        fetchChessApiEval(fen).then(r => r ? { ...r, _source: "chessapi" } : null),
    ];

    if (Math.random() < 0.4) {
        sources.push(
            (async () => {
                try {
                    const response = await fetch(`${HF_BASE}/evaluate`, {
                        method: "POST",
                        headers: HF_HEADERS,
                        body: JSON.stringify({ fen, depth: 18 }),
                        signal: AbortSignal.timeout(8000),
                    });
                    if (!response.ok) return null;
                    const data = await response.json();
                    const cp = data.score?.value ?? 0;
                    return cp !== 0 ? {
                        eval: cp / 100,
                        mate: null,
                        bestmove: data.best_move ?? "",
                        san: "",
                        continuationArr: [],
                        winChance: 50 + (cp / 200),
                        _source: "hf",
                    } : null;
                } catch { return null; }
            })()
        );
    }

    const settled = await Promise.allSettled(sources);
    for (const s of settled) {
        if (s.status === "fulfilled" && s.value) {
            const { _source, ...result } = s.value as any;
            return result;
        }
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
