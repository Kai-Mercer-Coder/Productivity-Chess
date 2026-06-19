abstract class BaseStockfishEngine {
  protected worker: Worker | null = null;
  protected isReady = false;

  constructor(workerPath: string) {
    try {
      this.worker = new Worker(workerPath);
      this.worker.onmessage = this.handleMessage.bind(this);
      this.postCommand("uci");
    } catch (error) {
      console.error(`Failed to load Stockfish worker at ${workerPath}:`, error);
    }
  }

  protected abstract handleMessage(event: MessageEvent): void;

  protected postCommand(command: string) {
    if (this.worker) {
      this.worker.postMessage(command);
    } else {
      console.error("Stockfish worker not initialized");
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

export default BaseStockfishEngine;
