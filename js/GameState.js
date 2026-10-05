import { CONFIG } from './config.js';

// Progresso da RUN (resetado a cada run).
function createRunState() {
  return {
    isRunActive: false,
    currentHP: CONFIG.maxHP,
    maxHP: CONFIG.maxHP,
    damagePerClick: CONFIG.damagePerClick,
    energy: 0,
    totalClicks: 0,
    currentCombo: 0,
    maxCombo: 0,
    comboMultiplier: 1,
    lastClickTime: 0,
  };
}

export class GameState {
  constructor() {
    this.run = createRunState();
    this.meta = {}; // PROGRESSO PERMANENTE (reservado; não resetado)
  }
  resetRun() {
    Object.assign(this.run, createRunState()); // mantém a mesma referência
  }
}
