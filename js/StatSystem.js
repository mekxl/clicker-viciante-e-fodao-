// Stats centralizados: (base + add) × (1 + Σmult) × Π(more).
// Modificador: {stat,type:'add'|'mult'|'more',value,stacks,scale?,cond?}
import { CONFIG } from './config.js';

const BASE = { damage: CONFIG.damagePerClick, energy: CONFIG.energyPerClick,
  comboTimeout: CONFIG.comboTimeout, maxHP: CONFIG.maxHP };
// Futuro: criticalChance, criticalMultiplier, automationDamage... basta usar o nome.

export class StatSystem {
  constructor(state) { this.state = state; this.run = []; this.meta = []; }
  addRun(m) { this.run.push(m); }
  addMeta(m) { this.meta.push(m); }
  clearRun() { this.run.length = 0; }
  clearMeta() { this.meta.length = 0; }

  context(now) {
    const r = this.state.run;
    return { combo: r.currentCombo, hpRatio: r.currentHP / r.maxHP, energy: r.energy,
      overload: now < r.overloadUntil, tags: r.tagCounts };
  }
  factor(m, ctx) {
    if (m.cond === 'lowHP' && !(ctx.hpRatio < CONFIG.lowHPThreshold)) return 0;
    if (m.cond === 'highHP' && !(ctx.hpRatio > CONFIG.highHPThreshold)) return 0;
    if (m.cond === 'overload' && !ctx.overload) return 0;
    const s = m.scale;
    if (!s) return 1;
    if (s === 'combo') return ctx.combo || 0;
    if (s === 'energy10') return Math.floor((ctx.energy || 0) / 10);
    if (s.startsWith('tag:')) return (ctx.tags && ctx.tags[s.slice(4)]) || 0;
    return 1;
  }
  get(stat, ctx = this.context(performance.now())) {
    let add = 0, mult = 0, more = 1;
    for (const list of [this.meta, this.run]) {
      for (const m of list) {
        if (m.stat !== stat) continue;
        const f = this.factor(m, ctx);
        if (!f) continue;
        if (m.type === 'add') add += m.value * m.stacks * f;
        else if (m.type === 'mult') mult += m.value * m.stacks * f;
        else more *= Math.pow(1 + m.value * f, m.stacks);
      }
    }
    return Math.max(0, ((BASE[stat] || 0) + add) * (1 + mult) * more);
  }
}
