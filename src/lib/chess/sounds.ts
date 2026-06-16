let moveAudio: HTMLAudioElement | null = null;
let captureAudio: HTMLAudioElement | null = null;

function getMove() {
  if (!moveAudio) moveAudio = new Audio('/Move.mp3');
  return moveAudio;
}

function getCapture() {
  if (!captureAudio) captureAudio = new Audio('/Capture.mp3');
  return captureAudio;
}

export function playMoveSound() {
  try { (getMove().cloneNode(true) as HTMLAudioElement).play(); } catch {}
}

export function playCaptureSound() {
  try { (getCapture().cloneNode(true) as HTMLAudioElement).play(); } catch {}
}
