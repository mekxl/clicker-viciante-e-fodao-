import { CONFIG } from './config.js';

export class ComboSystem {
  constructor(state, stats) { this.state = state; this.stats = stats; }
  get comboTimeout() { return Math.max(200, this.stats.get('comboTimeout')); }
  multiplierFor(c) { return CONFIG.comboTiers.find(t => c >= t.min).mult; }
  register(now) {
    const r = this.state.run;
    r.currentCombo++;
    if (r.currentCombo > r.maxCombo) r.maxCombo = r.currentCombo;
    r.comboMultiplier = this.multiplierFor(r.currentCombo);
    r.lastClickTime = now;
  }
  update(now) { // retorna true se expirou
    const r = this.state.run;
    if (r.isRunActive && !r.isPaused && r.currentCombo > 0 && now - r.lastClickTime > this.comboTimeout) {
      this.reset(); return true;
    }
    return false;
  }
  timeRatio(now) {
    const r = this.state.run;
    return r.currentCombo === 0 ? 0 : Math.max(0, 1 - (now - r.lastClickTime) / this.comboTimeout);
  }
  reset() { const r = this.state.run; r.currentCombo = 0; r.comboMultiplier = 1; }
}
