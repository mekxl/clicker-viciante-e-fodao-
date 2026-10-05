import { EnemyState as S } from './Enemy.js';
import { EVENTS } from './EventBus.js';

// Fases de boss. Usa o mesmo Enemy; só adiciona controle de fase por limiar de HP.
// O índice da fase só avança → cada limiar dispara no máximo UMA vez (curas não reabrem fases).
export class BossSystem {
  constructor(combat) { this.combat = combat; }
  init(e) { e.phase = 1; if (e.behavior.onPhase) e.behavior.onPhase(e, this.combat.svc); }
  checkPhase(e) {
    const ph = e.def.phases;
    if (!ph) return;
    while (e.phase < ph.length && e.state !== S.DEFEATED && e.hpRatio <= ph[e.phase].hpBelow) {
      this.setPhase(e, e.phase + 1); // um golpe grande pode atravessar 2 limiares: 1 evento por fase
    }
  }
  setPhase(e, to) {
    const from = e.phase;
    e.phase = to;
    if (e.behavior.onPhase) e.behavior.onPhase(e, this.combat.svc);
    this.combat.events.emit(EVENTS.BOSS_PHASE_CHANGED, { enemy: e, from, to, name: e.phaseDef.name });
  }
}
