export class DamageSystem {
  constructor(state, stats) {
    this.state = state; this.stats = stats;
    this.modifiers = [];       // ganchos extras do dano de HP: fn(ctx)
    this.breakModifiers = [];  // ganchos do dano de BREAK (relíquias futuras): fn(ctx)
    this.lastMultiplier = 1;   // multiplicador total do último golpe (estatística)
  }
  addModifier(fn) { this.modifiers.push(fn); }
  addBreakModifier(fn) { this.breakModifiers.push(fn); }

  // Dano ao HP: base (add/mult/more via stats) × combo × modificador do inimigo (estado + comportamento).
  calculateClickDamage(now = performance.now(), enemy = null) {
    const run = this.state.run;
    const ctx = { damage: this.stats.get('damage', this.stats.context(now)),
      multiplier: run.comboMultiplier, crit: false, enemy };
    for (const m of this.modifiers) m(ctx);
    if (enemy) ctx.multiplier *= enemy.damageTakenMult({ comboMult: run.comboMultiplier });
    this.lastMultiplier = ctx.multiplier;
    return Math.max(1, Math.round(ctx.damage * ctx.multiplier));
  }
  // Dano de BREAK: independente do HP (stat próprio 'breakDamage').
  calculateBreakDamage(now = performance.now(), enemy = null) {
    const run = this.state.run;
    const ctx = { breakDamage: this.stats.get('breakDamage', this.stats.context(now)),
      multiplier: run.comboMultiplier, enemy };
    for (const m of this.breakModifiers) m(ctx);
    if (enemy) ctx.multiplier *= enemy.breakTakenMult({ comboMult: run.comboMultiplier });
    return Math.max(0, ctx.breakDamage * ctx.multiplier);
  }
  // Funções SEPARADAS: uma mexe no HP, a outra na barra de BREAK. Retornam o efetivamente aplicado.
  applyDamage(amount, target) { return target.dealDamage(amount); }
  applyBreakDamage(amount, target) { return target.dealBreakDamage(amount); }
}
