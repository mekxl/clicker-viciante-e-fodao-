// META STATE: fragmentos e upgrades permanentes, com save em localStorage.
import { CONFIG } from './config.js';
import { META_UPGRADES } from './metaUpgrades.js';

export function calculateRunReward(run) {
  const k = CONFIG.reward;
  const raw = run.totalClicks * k.perClick + Math.sqrt(run.totalDamage) * k.perSqrtDamage
    + run.milestoneIndex * k.perMilestone + run.maxCombo * k.perCombo;
  return Math.max(1, Math.floor(raw)); // cresce de forma sublinear, limitada pelo HP do alvo
}

export class MetaSystem {
  constructor(state) { this.state = state; this.load(); }
  get m() { return this.state.meta; }
  level(id) { return this.m.levels[id] || 0; }
  cost(def) { return Math.round(def.baseCost * Math.pow(1.6, this.level(def.id))); }
  canBuy(def) { return this.level(def.id) < def.maxLevel && this.m.fragments >= this.cost(def); }
  buy(id) {
    const def = META_UPGRADES.find(d => d.id === id);
    if (!def || !this.canBuy(def)) return false;
    this.m.fragments -= this.cost(def);
    this.m.levels[id] = this.level(id) + 1;
    this.save();
    return true;
  }
  addFragments(n) { this.m.fragments += n; this.save(); }
  applyTo(stats) { // reaplica bônus permanentes (chamado a cada nova run)
    stats.clearMeta();
    for (const d of META_UPGRADES) {
      const lv = this.level(d.id);
      if (lv > 0) for (const e of d.effects) stats.addMeta({ ...e, stacks: lv });
    }
  }
  save() { try { localStorage.setItem(CONFIG.saveKey, JSON.stringify(this.m)); } catch (e) {} }
  load() {
    try {
      const d = JSON.parse(localStorage.getItem(CONFIG.saveKey));
      if (d && typeof d.fragments === 'number') this.state.meta = { fragments: d.fragments, levels: d.levels || {} };
    } catch (e) {}
  }
}
