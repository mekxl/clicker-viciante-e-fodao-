import { calculateRunReward } from './MetaSystem.js';
import { EVENTS } from './EventBus.js';

export class RunManager {
  constructor(state, sys) { Object.assign(this, { state }, sys); }
  startRun() {
    const r = this.state.run;
    this.state.resetRun();            // RUN STATE zera; META STATE permanece
    this.stats.clearRun();
    this.meta.applyTo(this.stats);    // aplica bônus permanentes
    r.coreMaxHP = r.coreHP = Math.round(this.stats.get('maxHP')); // HP do jogador (reservado p/ ataques inimigos)
    this.currency.reset();
    this.currency.addEnergy(Math.round(this.stats.get('startEnergy')));
    this.combo.reset();
    this.combat.reset();
    this.feedback.clear();
    r.isRunActive = true;
    this.events.emit(EVENTS.RUN_STARTED, {});
    this.encounters.start();          // primeiro encontro (preenche currentHP/maxHP com o inimigo)
    this.ui.hideOverlay(); this.ui.hideChoices();
    this.ui.render(); this.ui.renderBuild(); this.ui.renderComboTimer(0);
  }
  endRun() {
    const r = this.state.run;
    if (!r.isRunActive) return;
    r.isRunActive = false;
    this.encounters.stop();
    this.combat.clear();
    const reward = calculateRunReward(r);
    this.meta.addFragments(reward);
    this.feedback.death();
    this.events.emit(EVENTS.RUN_ENDED, {});
    this.ui.render();
    const summary = { clicks: r.totalClicks, damage: r.totalDamage, maxCombo: r.maxCombo,
      upgrades: Object.values(r.upgrades).reduce((a, b) => a + b, 0), reward,
      // Etapa 3 (para a tela de fim de run)
      highestCombo: r.maxCombo, enemiesDefeated: r.enemiesDefeated, bossesDefeated: r.bossesDefeated,
      totalBreaks: r.totalBreaks, highestDamageHit: r.highestDamageHit, highestMultiplier: r.highestMultiplier,
      stage: r.stage, difficultyTier: r.difficultyTier };
    setTimeout(() => this.ui.showEnd(summary, () => this.showHub()), 600);
  }
  restartRun() { this.startRun(); }
  showHub() {
    this.ui.showHub(this.meta, {
      onStart: () => this.startRun(),
      onBuy: id => { this.meta.buy(id); this.showHub(); },
    });
  }
}
