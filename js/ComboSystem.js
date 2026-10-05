import { CONFIG } from './config.js';

export class ComboSystem {
  constructor(state) {
    this.state = state;
    this.comboTimeout = CONFIG.comboTimeout;
  }
  multiplierFor(combo) {
    return CONFIG.comboTiers.find(t => combo >= t.min).mult;
  }
  register(now) {
    const r = this.state.run;
    r.currentCombo++;
    if (r.currentCombo > r.maxCombo) r.maxCombo = r.currentCombo;
    r.comboMultiplier = this.multiplierFor(r.currentCombo);
    r.lastClickTime = now;
  }
  // Chamado a cada frame; retorna true se o combo expirou.
  update(now) {
    const r = this.state.run;
    if (r.isRunActive && r.currentCombo > 0 && now - r.lastClickTime > this.comboTimeout) {
      this.reset();
      return true;
    }
    return false;
  }
  timeRatio(now) {
    const r = this.state.run;
    if (r.currentCombo === 0) return 0;
    return Math.max(0, 1 - (now - r.lastClickTime) / this.comboTimeout);
  }
  reset() {
    const r = this.state.run;
    r.currentCombo = 0;
    r.comboMultiplier = 1;
  }
}
