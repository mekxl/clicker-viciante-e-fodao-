import { CONFIG } from './config.js';

export class ClickSystem {
  constructor(state, sys) { Object.assign(this, { state }, sys); }

  // ProcessClick → strike (Damage → Apply HP → Energy → Apply BREAK) → Combo → [Repeat] → Feedback → Marcos
  processClick(px, py) {
    const r = this.state.run;
    if (!r.isRunActive || r.isPaused) return;
    if (!this.combat.canAttack()) return; // inimigo nascendo/derrotado: o clique não faz nada
    const now = performance.now();
    r.totalClicks++;
    const every = Math.round(this.stats.get('overloadEvery'));
    if (every > 0 && r.totalClicks % every === 0) r.overloadUntil = now + CONFIG.overloadDuration;
    this.strike(px, py, now);
    this.combo.register(now);
    // BREAK reforça efeitos do jogador (chance de repetição). Se o alvo morreu, não repete.
    if (r.isRunActive && this.combat.canAttack()
      && Math.random() < this.stats.get('repeatChance') * this.combat.effectBoost()) this.strike(px, py, now);
    this.ui.render();
    if (!r.isRunActive) return;
    const n = this.milestones.check(r);
    if (n > 0) { r.pendingChoices = n - 1; this.upgrades.offerChoice(); }
  }

  strike(px, py, now) {
    const r = this.state.run, e = this.combat.enemy;
    if (!this.combat.canAttack()) return;
    // Tudo é calculado ANTES de aplicar, sobre o estado atual do inimigo.
    const dmg = this.damage.calculateClickDamage(now, e);
    const mult = this.damage.lastMultiplier;
    const brk = this.damage.calculateBreakDamage(now, e);
    const dealt = this.damage.applyDamage(dmg, this.combat);        // HP
    if (dealt <= 0) return;
    r.totalDamage += dealt;
    if (dmg > r.highestDamageHit) r.highestDamageHit = dmg;
    if (mult > r.highestMultiplier) r.highestMultiplier = mult;
    this.currency.addEnergy(Math.max(1, Math.round(this.stats.get('energy', this.stats.context(now)))));
    if (brk > 0) this.damage.applyBreakDamage(brk, this.combat);    // BREAK (ignorado se o alvo morreu)
    this.feedback.hit(px, py, dealt, r.currentCombo, r.comboMultiplier);
  }
}
