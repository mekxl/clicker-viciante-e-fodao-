import { CONFIG } from './config.js';

export class ComboSystem {
  constructor(state, stats) { this.state = state; this.stats = stats; this.timeoutScale = 1; this.lock = 0; }
  get comboTimeout() { return Math.max(200, this.stats.get('comboTimeout') * this.timeoutScale); }
  multiplierFor(c) { return CONFIG.comboTiers.find(t => c >= t.min).mult; }
  register(now) {
    if (this.lock > 0) return false; // combo interrompido por inimigo/boss
    const r = this.state.run;
    r.currentCombo++;
    if (r.currentCombo > r.maxCombo) r.maxCombo = r.currentCombo;
    r.comboMultiplier = this.multiplierFor(r.currentCombo);
    r.lastClickTime = now;
    return true;
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

  // ---- Etapa 3: interferência de inimigos ----
  drain(fraction) { // remove uma fração do combo; true se mudou algo
    const r = this.state.run;
    if (r.currentCombo <= 0) return false;
    r.currentCombo = Math.floor(r.currentCombo * (1 - fraction));
    r.comboMultiplier = this.multiplierFor(r.currentCombo);
    return true;
  }
  interrupt(ms) { this.reset(); this.lock = ms; } // zera e impede reconstruir por `ms`
  unlock() { this.lock = 0; }
  tickLock(dt) { if (this.lock > 0) this.lock = Math.max(0, this.lock - dt); } // dt=0 pausado
  clearModifiers() { this.timeoutScale = 1; this.lock = 0; }
}
