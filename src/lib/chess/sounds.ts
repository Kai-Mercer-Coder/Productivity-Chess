let moveAudio: HTMLAudioElement | null = null;
let captureAudio: HTMLAudioElement | null = null;

function getMoveAudio() {
  if (!moveAudio) moveAudio = new Audio('/Move.mp3');
  return moveAudio;
}

function getCaptureAudio() {
  if (!captureAudio) captureAudio = new Audio('/Capture.mp3');
  return captureAudio;
}

export function playMoveSound() {
  const a = getMoveAudio();
  a.currentTime = 0;
  a.play().catch(() => {});
}

export function playCaptureSound() {
  const a = getCaptureAudio();
  a.currentTime = 0;
  a.play().catch(() => {});
}
