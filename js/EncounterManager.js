import { CONFIG } from './config.js';
import { EVENTS } from './EventBus.js';
import { createEnemy, encounterAt } from './enemies.js';

const K = CONFIG.combat;

// Progressão da run: escolhe o inimigo, concede recompensa, avança, chama o boss, sobe o tier.
export class EncounterManager {
  constructor(state, { combat, currency, events }) {
    this.state = state; this.combat = combat; this.currency = currency; this.events = events;
    this.delay = 0; // ms até o próximo encontro
    events.on(EVENTS.ENEMY_DEFEATED, ({ enemy }) => this.end(enemy));
  }
  start() { this.delay = 0; this.begin(); }
  stop() { this.delay = 0; }

  begin() {
    const r = this.state.run;
    if (!r.isRunActive) return;
    this.delay = 0;
    r.stage++;
    const e = createEnemy(encounterAt(r.encounterIndex), r.stage, r.difficultyTier);
    this.combat.spawn(e);
    this.events.emit(EVENTS.ENCOUNTER_STARTED, { enemy: e, stage: r.stage, tier: r.difficultyTier });
  }

  rewardFor(e) { return Math.max(1, Math.round(e.baseReward * e.rewardMult())); }

  end(e) {
    if (e.rewardClaimed) return; // nunca paga duas vezes
    e.rewardClaimed = true;
    const r = this.state.run;
    if (!r.isRunActive) return;
    r.enemiesDefeated++;
    r.encounterIndex++;
    const reward = this.rewardFor(e);
    this.currency.addEnergy(reward);
    this.delay = e.isBoss ? K.bossDefeatDelay : K.defeatDelay;
    this.events.emit(EVENTS.ENCOUNTER_ENDED, { enemy: e, reward, isBoss: e.isBoss });
    if (e.isBoss) {
      r.bossesDefeated++;
      r.difficultyTier++;
      this.events.emit(EVENTS.BOSS_DEFEATED, { enemy: e, reward });
      this.events.emit(EVENTS.DIFFICULTY_CHANGED, { tier: r.difficultyTier });
      this.events.emit(EVENTS.BOSS_REWARD_READY, { enemy: e, tier: r.difficultyTier }); // Prompt 4 escuta aqui
    }
  }

  update(dt) {
    if (this.delay <= 0) return;
    if (!this.state.run.isRunActive) { this.delay = 0; return; }
    this.delay -= dt;
    if (this.delay <= 0) this.begin();
  }
}
