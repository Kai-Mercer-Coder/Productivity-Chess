import type { AssessmentNode, Coach as WintrCoach } from "wintrchess/coach";

export type CoachExplanation =
  | { type: "text"; text: string }
  | { type: "square"; square: string }
  | { type: "piece"; role: string; square: string; full?: boolean };

export interface CoachResult {
  explanation: string;
  tokens: CoachExplanation[];
  statements: string[];
  classification?: string;
  model: string;
}

export class CoachService {
  private coach: WintrCoach | null = null;
  private engineReady = false;
  private engine: import("wintrchess/engine").BrowserEngine | null = null;

  async init(opts: {
    stockfishUrl: string;
    apiKey: string;
    baseURL?: string;
    model?: string;
  }): Promise<void> {
    if (this.coach) return;

    const { BrowserEngine } = await import("wintrchess/engine");
    const { Coach } = await import("wintrchess/coach");

    this.engine = await BrowserEngine.create(opts.stockfishUrl);
    this.engineReady = true;

    this.coach = new Coach({
      engine: this.engine,
      llm: {
        apiKey: opts.apiKey,
        baseURL: opts.baseURL,
        dangerouslyAllowBrowser: true,
      },
    });
  }

  async explain(
    fen: string,
    moveUCI?: string,
    opts?: {
      model?: string;
      personality?: string;
      person?: "first" | "second" | "third";
    },
  ): Promise<CoachResult> {
    if (!this.coach || !this.engine) {
      throw new Error("Coach not initialized. Call init() first.");
    }

    const { contextualizeMove } = await import("wintrchess/types");
    const chessops = await import("chessops");
    const { parseFen } = await import("chessops/fen");

    const setup = parseFen(fen).unwrap();
    const chessopsPos = chessops.Chess.fromSetup(setup).unwrap();

    let move: ReturnType<typeof contextualizeMove> | undefined;
    if (moveUCI && moveUCI.length >= 4) {
      const fromSq = moveUCI.slice(0, 2);
      const toSq = moveUCI.slice(2, 4);
      const from = chessops.parseSquare(fromSq);
      const to = chessops.parseSquare(toSq);
      if (from === undefined || to === undefined) throw new Error(`Invalid UCI move: ${moveUCI}`);
      const uciPromotion = moveUCI.length > 4 ? moveUCI.slice(4) : undefined;
      const uciToRole: Record<string, "queen" | "rook" | "bishop" | "knight"> = {
        q: "queen", r: "rook", b: "bishop", n: "knight",
      };
      const promotion = uciPromotion ? uciToRole[uciPromotion] : undefined;
      const normalMove = { from, to, promotion };
      move = contextualizeMove(chessopsPos, normalMove);
    }

    const rootNode = await this.coach.createAssessment({
      position: chessopsPos,
      move,
    });

    const model = opts?.model || "google/gemini-2.0-flash-001";
    const rawExplanation = await this.coach.createExplanation(rootNode, {
      model,
      personality: opts?.personality,
      person: opts?.person,
      rawResponse: true,
    });

    const { tokenizeExplanation, squareLabel } = await import(
      "wintrchess/coach"
    );
    const rawTokens = tokenizeExplanation(rawExplanation);
    const tokens: CoachExplanation[] = rawTokens.map((t) => {
      if (t.type === "square")
        return { type: "square", square: squareLabel(t.square) };
      if (t.type === "piece")
        return {
          type: "piece",
          role: t.role,
          square: squareLabel(t.square),
          full: t.full,
        };
      return { type: "text", text: t.text };
    });

    return {
      explanation: rawExplanation,
      tokens,
      statements: this.collectStatements(rootNode),
      classification: rootNode.context.move?.classification,
      model,
    };
  }

  async terminate(): Promise<void> {
    if (this.engine) {
      this.engine.terminate();
      this.engine = null;
    }
    this.coach = null;
    this.engineReady = false;
  }

  get isReady(): boolean {
    return this.engineReady;
  }

  private collectStatements(node: AssessmentNode): string[] {
    const statements = [...node.statements];
    for (const child of node.children) {
      statements.push(...this.collectStatements(child));
    }
    return statements;
  }
}
