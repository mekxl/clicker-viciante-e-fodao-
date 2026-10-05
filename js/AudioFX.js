// Sons sintetizados (sem arquivos). O AudioContext só nasce após um gesto do jogador.
export class AudioFX {
  constructor() { this.ctx = null; this.drone = null; }
  ensure() {
    try {
      if (!this.ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; this.ctx = new A(); }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { return null; }
    return this.ctx;
  }
  tone(f, d, type = 'sine', g = 0.12, to = f) {
    const c = this.ensure(); if (!c) return;
    const t = c.currentTime, o = c.createOscillator(), v = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + d);
    v.gain.setValueAtTime(g, t); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(v); v.connect(c.destination); o.start(t); o.stop(t + d + 0.02);
  }
  // Durante o BREAK a "música" muda: um drone grave pulsa até o fim da janela.
  breakStart() { this.tone(240, 0.45, 'sawtooth', 0.18, 50); this.tone(70, 0.6, 'square', 0.12, 40); this.startDrone(); }
  startDrone() {
    const c = this.ensure(); if (!c || this.drone) return;
    const o = c.createOscillator(), f = c.createBiquadFilter(), v = c.createGain();
    o.type = 'sawtooth'; o.frequency.value = 55; f.type = 'lowpass'; f.frequency.value = 220;
    v.gain.setValueAtTime(0.0001, c.currentTime); v.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 0.2);
    o.connect(f); f.connect(v); v.connect(c.destination); o.start();
    this.drone = { o, v };
  }
  breakEnd() {
    const d = this.drone, c = this.ctx; if (!d) return;
    this.drone = null;
    const t = c.currentTime;
    d.v.gain.cancelScheduledValues(t); d.v.gain.setValueAtTime(Math.max(d.v.gain.value, 0.0002), t);
    d.v.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); d.o.stop(t + 0.3);
    this.tone(180, 0.25, 'triangle', 0.08, 90);
  }
  defeat(boss) { this.tone(boss ? 120 : 320, boss ? 0.9 : 0.25, 'triangle', 0.15, boss ? 30 : 80); }
  phase() { this.tone(100, 0.5, 'sawtooth', 0.2, 420); }
  cue() { this.tone(660, 0.1, 'square', 0.06, 990); }
}
