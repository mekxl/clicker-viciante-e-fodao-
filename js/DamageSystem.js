export class DamageSystem {
  constructor(state, stats) {
    this.state = state; this.stats = stats;
    this.modifiers = []; // ganchos extras: fn(ctx)
  }
  addModifier(fn) { this.modifiers.push(fn); }
  // Dano base (add/mult/more via stats) × multiplicador de combo
  calculateClickDamage(now = performance.now()) {
    const ctx = { damage: this.stats.get('damage', this.stats.context(now)),
      multiplier: this.state.run.comboMultiplier, crit: false };
    for (const m of this.modifiers) m(ctx);
    return Math.max(1, Math.round(ctx.damage * ctx.multiplier));
  }
  applyDamage(amount, target) { return target.takeDamage(amount); }
}
