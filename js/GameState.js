import { CONFIG } from './config.js';

// RUN STATE: resetado a cada run.
function createRunState() {
  return {
    isRunActive: false, isPaused: false, pausedAt: 0,
    currentHP: CONFIG.maxHP, maxHP: CONFIG.maxHP, damagePerClick: CONFIG.damagePerClick,
    energy: 0, totalClicks: 0, totalDamage: 0,
    currentCombo: 0, maxCombo: 0, comboMultiplier: 1, lastClickTime: 0,
    upgrades: {}, tagCounts: {}, milestoneIndex: 0, pendingChoices: 0, overloadUntil: 0,
  };
}
// META STATE: persiste entre runs (carregado/salvo pelo MetaSystem).
export class GameState {
  constructor() {
    this.run = createRunState();
    this.meta = { fragments: 0, levels: {} };
  }
  resetRun() { Object.assign(this.run, createRunState()); } // NÃO toca em meta
  pause(now) { const r = this.run; if (!r.isPaused) { r.isPaused = true; r.pausedAt = now; } }
  resume(now) { // desloca timers para retomar exatamente de onde parou
    const r = this.run;
    if (!r.isPaused) return;
    const d = now - r.pausedAt;
    r.lastClickTime += d;
    if (r.overloadUntil) r.overloadUntil += d;
    r.isPaused = false;
  }
}
