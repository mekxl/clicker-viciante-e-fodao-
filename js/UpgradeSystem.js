import { UPGRADES_BY_ID } from './upgrades.js';

export class UpgradeSystem {
  constructor(state, stats, loot, ui) { Object.assign(this, { state, stats, loot, ui }); }
  acquire(id) {
    const r = this.state.run, u = UPGRADES_BY_ID[id];
    if (!u || (r.upgrades[id] || 0) >= u.stackLimit) return false; // respeita stackLimit
    r.upgrades[id] = (r.upgrades[id] || 0) + 1;
    u.tags.forEach(t => { r.tagCounts[t] = (r.tagCounts[t] || 0) + 1; });
    this.rebuild();
    return true;
  }
  // Reconstrói modificadores da run a partir dos stacks (dados → lógica).
  rebuild() {
    this.stats.clearRun();
    for (const [id, n] of Object.entries(this.state.run.upgrades))
      for (const e of UPGRADES_BY_ID[id].effects) this.stats.addRun({ ...e, stacks: n });
  }
  offerChoice() {
    const r = this.state.run, opts = this.loot.rollChoices();
    if (!opts.length) return;
    this.state.pause(performance.now()); // congela cliques, combo e timers
    let done = false;
    this.ui.showChoices(opts, r.upgrades, id => {
      if (done) return; done = true;       // só uma escolha
      this.acquire(id);
      this.ui.hideChoices();
      this.state.resume(performance.now());
      this.ui.render(); this.ui.renderBuild();
      if (r.pendingChoices > 0) { r.pendingChoices--; this.offerChoice(); }
    });
  }
}
