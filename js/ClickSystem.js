export class ClickSystem {
  constructor(state, { damage, target, currency, combo, feedback, ui }) {
    Object.assign(this, { state, damage, target, currency, combo, feedback, ui });
  }

  // Pipeline: ProcessClick → Calculate → Apply → Energy → Combo → Feedback
  processClick(px, py) {
    const r = this.state.run;
    if (!r.isRunActive) return;
    r.totalClicks++;
    const dmg = this.damage.calculateClickDamage();
    this.damage.applyDamage(dmg, this.target);
    this.currency.addEnergy();
    this.combo.register(performance.now());
    this.feedback.hit(px, py, dmg, r.currentCombo, r.comboMultiplier);
    this.ui.render(); // se morreu, o RunManager já encerrou a run via callback
  }
}
