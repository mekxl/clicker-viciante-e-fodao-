import { calculateRunReward } from './MetaSystem.js';

export class RunManager {
  constructor(state, sys) {
    Object.assign(this, { state }, sys);
    this.target.onDeath = () => this.endRun();
  }
  startRun() {
    const r = this.state.run;
    this.state.resetRun();            // RUN STATE zera; META STATE permanece
    this.stats.clearRun();
    this.meta.applyTo(this.stats);    // aplica bônus permanentes
    r.maxHP = r.currentHP = Math.round(this.stats.get('maxHP'));
    this.currency.reset();
    this.currency.addEnergy(Math.round(this.stats.get('startEnergy')));
    this.combo.reset();
    this.feedback.clear();
    r.isRunActive = true;
    this.ui.hideOverlay(); this.ui.hideChoices();
    this.ui.render(); this.ui.renderBuild(); this.ui.renderComboTimer(0);
  }
  endRun() {
    const r = this.state.run;
    if (!r.isRunActive) return;
    r.isRunActive = false;
    const reward = calculateRunReward(r);
    this.meta.addFragments(reward);
    this.feedback.death();
    this.ui.render();
    const summary = { clicks: r.totalClicks, damage: r.totalDamage, maxCombo: r.maxCombo,
      upgrades: Object.values(r.upgrades).reduce((a, b) => a + b, 0), reward };
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
