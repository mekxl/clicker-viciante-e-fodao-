export class DamageSystem {
  constructor(state) {
    this.state = state;
    // Futuro: relíquias/upgrades registram modificadores aqui.
    this.modifiers = []; // fn(ctx) => altera ctx.damage / ctx.multiplier
  }
  addModifier(fn) { this.modifiers.push(fn); }

  calculateClickDamage() {
    const r = this.state.run;
    const ctx = { damage: r.damagePerClick, multiplier: r.comboMultiplier, crit: false };
    for (const m of this.modifiers) m(ctx);
    return Math.max(1, Math.round(ctx.damage * ctx.multiplier));
  }

  applyDamage(amount, target) {
    return target.takeDamage(amount);
  }
}
