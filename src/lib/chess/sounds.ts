import type { Chess } from "chess.js";

let moveAudio: HTMLAudioElement | null = null;
let captureAudio: HTMLAudioElement | null = null;
let checkAudio: HTMLAudioElement | null = null;
let gameOverAudio: HTMLAudioElement | null = null;

function getMove() {
  if (!moveAudio) moveAudio = new Audio('/SwiftMove.mp3');
  return moveAudio;
}

function getCapture() {
  if (!captureAudio) captureAudio = new Audio('/SwiftCapture.mp3');
  return captureAudio;
}

function getCheck() {
  if (!checkAudio) checkAudio = new Audio('/Check.mp3');
  return checkAudio;
}

function getGameOver() {
  if (!gameOverAudio) gameOverAudio = new Audio('/GameOver.mp3');
  return gameOverAudio;
}

export function playMoveSound(opts?: { isCapture?: boolean; isCheck?: boolean; isGameOver?: boolean }) {
  try {
    if (opts?.isGameOver) {
      (getGameOver().cloneNode(true) as HTMLAudioElement).play();
      return;
    }
    if (opts?.isCheck) {
      (getCheck().cloneNode(true) as HTMLAudioElement).play();
      return;
    }
    if (opts?.isCapture) {
      (getCapture().cloneNode(true) as HTMLAudioElement).play();
      return;
    }
    (getMove().cloneNode(true) as HTMLAudioElement).play();
  } catch {}
}

export function playCaptureSound() {
  try { (getCapture().cloneNode(true) as HTMLAudioElement).play(); } catch {}
}

export function playSoundForMove(game: Chess) {
  try {
    const last = game.history({ verbose: true }).at(-1);
    playMoveSound({
      isCapture: last?.captured !== undefined,
      isCheck: game.isCheck(),
      isGameOver: game.isGameOver(),
    });
  } catch {}
}
