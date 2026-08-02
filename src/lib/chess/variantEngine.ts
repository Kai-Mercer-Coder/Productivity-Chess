const STOCKFISH_JS = '/stockfish-mv/stockfish.js';

let engineInstance: any = null;
let initPromise: Promise<any> | null = null;

function loadScript(): Promise<any> {
  if (engineInstance) return Promise.resolve(engineInstance);
  if (initPromise) return initPromise;

  initPromise = new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return reject(new Error('Client-side only'));

    console.log('[variantEngine] crossOriginIsolated:', (self as any).crossOriginIsolated);
    console.log('[variantEngine] SharedArrayBuffer:', typeof SharedArrayBuffer);

    console.log('[variantEngine] loading script from', STOCKFISH_JS);
    const script = document.createElement('script');
    script.src = STOCKFISH_JS;
    script.async = true;
    script.onload = async () => {
      try {
        const StockfishMv = (window as any).StockfishMv;
        if (!StockfishMv) {
          console.error('[variantEngine] StockfishMv not found on window');
          throw new Error('StockfishMv not found after script load');
        }

        console.log('[variantEngine] StockfishMv global found, calling StockfishMv()');
        const engineModule = {
          locateFile: (file: string) => `/stockfish-mv/${file}`,
          mainScriptUrlOrBlob: '/stockfish-mv/stockfish.js',
        };
        const sf = await Promise.race([
          StockfishMv(engineModule),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error('StockfishMv() timed out (30s)')), 30000)),
        ]);
        console.log('[variantEngine] StockfishMv() resolved');
        engineInstance = sf;
        resolve(sf);
      } catch (e) {
        console.error('[variantEngine] StockfishMv init failed:', e);
        reject(e);
      }
    };
    script.onerror = (err) => {
      console.error('[variantEngine] script onerror:', err);
      reject(new Error('Failed to load stockfish script'));
    };
    document.head.appendChild(script);
  });

  return initPromise;
}

const VARIANT_UCI_OPTS: Record<string, [string, string][]> = {
  chess960: [['UCI_Chess960', 'true']],
  giveaway: [['UCI_Variant', 'giveaway']],
  crazyhouse: [['UCI_Variant', 'crazyhouse']],
  atomic: [['UCI_Variant', 'atomic']],
  kingOfTheHill: [['UCI_Variant', 'kingofthehill']],
  threeCheck: [['UCI_Variant', '3check']],
  horde: [['UCI_Variant', 'horde']],
  racingKings: [['UCI_Variant', 'racingkings']],
};

function waitFor(sf: any, predicate: (line: string) => boolean, timeoutMs = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      sf.removeMessageListener(listener);
      reject(new Error('UCI timeout'));
    }, timeoutMs);
    const listener = (line: string) => {
      if (predicate(line)) {
        clearTimeout(timer);
        sf.removeMessageListener(listener);
        resolve();
      }
    };
    sf.addMessageListener(listener);
  });
}

export async function initEngine(variant: string): Promise<void> {
  console.log('[variantEngine] initEngine', variant);
  const sf = await loadScript();
  console.log('[variantEngine] script loaded, registering listener then sending uci');
  const uciPromise = Promise.race([
    waitFor(sf, (l) => l === 'uciok'),
    new Promise<void>((_, reject) => setTimeout(() => reject(new Error('uciok timeout (15s)')), 15000)),
  ]);
  sf.postMessage('uci');
  console.log('[variantEngine] waiting for uciok...');
  await uciPromise;
  console.log('[variantEngine] uciok received');

  const opts = VARIANT_UCI_OPTS[variant] || [];
  for (const [name, value] of opts) {
    sf.postMessage(`setoption name ${name} value ${value}`);
  }
  console.log('[variantEngine] variant options set');
}

export async function destroyEngine(): Promise<void> {
  if (engineInstance) {
    engineInstance.postMessage('quit');
    engineInstance = null;
    initPromise = null;
  }
}

export async function getEngineBestMove(fen: string, variant: string, strength: number): Promise<string> {
  const sf = await loadScript();
  const skillLevel = Math.max(1, Math.min(20, Math.round(strength * 2)));

  if (VARIANT_UCI_OPTS[variant]) {
    for (const [name, value] of VARIANT_UCI_OPTS[variant]) {
      sf.postMessage(`setoption name ${name} value ${value}`);
    }
  } else {
    sf.postMessage('setoption name UCI_Variant value standard');
  }
  sf.postMessage(`setoption name Skill Level value ${skillLevel}`);

  sf.postMessage(`position fen ${fen}`);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      sf.removeMessageListener(listener);
      reject(new Error('Engine search timeout'));
    }, 60000);

    const listener = (line: string) => {
      if (line.startsWith('bestmove')) {
        clearTimeout(timer);
        sf.removeMessageListener(listener);
        const move = line.split(' ')[1] || '';
        resolve(move);
      }
    };
    sf.addMessageListener(listener);
    sf.postMessage('go depth 10');
  });
}

export function getStrengthElo(strength: number): number {
  return Math.round(800 + (strength - 1) * 200);
}
