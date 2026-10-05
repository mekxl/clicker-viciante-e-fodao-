import { CONFIG } from './config.js';

export class MilestoneSystem {
  constructor(list = CONFIG.milestones) { this.list = list; }
  // Retorna quantos marcos novos foram atingidos; o índice só avança (nunca repete).
  check(run) {
    let n = 0;
    while (run.milestoneIndex < this.list.length && run.totalClicks >= this.list[run.milestoneIndex]) {
      run.milestoneIndex++; n++;
    }
    return n;
  }
}
