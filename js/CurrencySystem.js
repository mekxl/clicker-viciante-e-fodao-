import { CONFIG } from './config.js';

export class CurrencySystem {
  constructor(state) { this.state = state; }
  addEnergy(n = CONFIG.energyPerClick) { this.state.run.energy += n; }
  getEnergy() { return this.state.run.energy; }
  spendEnergy(n) {
    if (this.state.run.energy < n) return false;
    this.state.run.energy -= n;
    return true;
  }
  reset() { this.state.run.energy = 0; }
}
