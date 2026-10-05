import { CONFIG } from './config.js';

export class ClickSystem {
  constructor(state, sys) { Object.assign(this, { state }, sys); }

  // ProcessClick → strike (Damage → Apply → Energy) → Combo → [Repeat] → Feedback → Marcos
  processClick(px, py) {
    const r = this.state.run;
    if (!r.isRunActive || r.isPaused) return;
    const now = performance.now();
    r.totalClicks++;
    const every = Math.round(this.stats.get('overloadEvery'));
    if (every > 0 && r.totalClicks % every === 0) r.overloadUntil = now + CONFIG.overloadDuration;
    this.strike(px, py, now);
    this.combo.register(now);
    if (r.isRunActive && Math.random() < this.stats.get('repeatChance')) this.strike(px, py, now);
    this.ui.render();
    if (!r.isRunActive) return; // alvo morreu: RunManager já encerrou
    const n = this.milestones.check(r);
    if (n > 0) { r.pendingChoices = n - 1; this.upgrades.offerChoice(); }
  }

  strike(px, py, now) {
    const r = this.state.run;
    const dmg = this.damage.calculateClickDamage(now);
    this.damage.applyDamage(dmg, this.target);
    r.totalDamage += dmg;
    this.currency.addEnergy(Math.max(1, Math.round(this.stats.get('energy', this.stats.context(now)))));
    this.feedback.hit(px, py, dmg, r.currentCombo, r.comboMultiplier);
  }
}
