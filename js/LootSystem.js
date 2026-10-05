import { RARITY, CONFIG } from './config.js';
import { UPGRADES } from './upgrades.js';

const ORDER = Object.keys(RARITY);

export class LootSystem {
  constructor(state, stats) { this.state = state; this.stats = stats; }
  eligible() {
    const r = this.state.run;
    return UPGRADES.filter(u => (r.upgrades[u.id] || 0) < u.stackLimit
      && (!u.requires || (r.tagCounts[u.requires.tag] || 0) >= u.requires.count));
  }
  rollRarity(luck) {
    const w = ORDER.map((k, i) => RARITY[k].weight * (i > 0 ? 1 + 0.25 * luck : 1));
    let x = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < w.length; i++) if ((x -= w[i]) < 0) return ORDER[i];
    return ORDER[0];
  }
  rollOne(pool, luck, quality) {
    let best = null;
    for (let i = 0; i <= quality; i++) { // Conhecimento: mais tentativas, fica a melhor
      let c = pool.filter(u => u.rarity === this.rollRarity(luck));
      if (!c.length) c = pool;
      const p = c[Math.floor(Math.random() * c.length)];
      if (!best || ORDER.indexOf(p.rarity) > ORDER.indexOf(best.rarity)) best = p;
    }
    return best;
  }
  // Sem repetidos; só upgrades que ainda podem ser obtidos.
  rollChoices(n = CONFIG.choiceCount) {
    const luck = Math.round(this.stats.get('luck')), q = Math.round(this.stats.get('quality'));
    let pool = this.eligible(); const out = [];
    while (out.length < n && pool.length) {
      const u = this.rollOne(pool, luck, q);
      out.push(u); pool = pool.filter(x => x !== u);
    }
    return out;
  }
}
