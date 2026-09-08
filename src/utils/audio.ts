/**
 * Web Audio API synthesizer for realistic mechanical calculator key clicks
 * and subtle tactile audio feedback.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playKeySound(type: 'num' | 'op' | 'func' | 'equals' | 'delete' = 'num') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    let freq = 1200;
    let duration = 0.025;
    let volume = 0.04;

    switch (type) {
      case 'equals':
        freq = 880;
        duration = 0.045;
        volume = 0.06;
        osc.type = 'triangle';
        break;
      case 'op':
        freq = 1400;
        duration = 0.028;
        volume = 0.045;
        osc.type = 'sine';
        break;
      case 'delete':
        freq = 600;
        duration = 0.035;
        volume = 0.05;
        osc.type = 'square';
        break;
      case 'func':
        freq = 1650;
        duration = 0.02;
        volume = 0.035;
        osc.type = 'sine';
        break;
      case 'num':
      default:
        freq = 1100 + Math.random() * 80;
        duration = 0.02;
        volume = 0.03;
        osc.type = 'sine';
        break;
    }

    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + duration);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // Audio context may be restricted before gesture
  }
}

export function triggerHapticVibration(durationMs: number = 10) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(durationMs);
    } catch {
      // ignore
    }
  }
}
