// Barramento de eventos: a lógica de combate emite, UI/feedback/upgrades/relíquias escutam.
export const EVENTS = Object.freeze({
  RUN_STARTED: 'OnRunStarted',
  RUN_ENDED: 'OnRunEnded',
  ENCOUNTER_STARTED: 'OnEncounterStarted',
  ENCOUNTER_ENDED: 'OnEncounterEnded',
  ENEMY_SPAWNED: 'OnEnemySpawned',
  ENEMY_ACTIVE: 'OnEnemyActive',
  ENEMY_DAMAGED: 'OnEnemyDamaged',
  ENEMY_DEFEATED: 'OnEnemyDefeated',
  ENEMY_EFFECT: 'OnEnemyEffect',          // comportamentos: drain, gaze, blast...
  BREAK_STARTED: 'OnBreakStarted',
  BREAK_ENDED: 'OnBreakEnded',
  BOSS_PHASE_CHANGED: 'OnBossPhaseChanged',
  BOSS_DEFEATED: 'OnBossDefeated',
  BOSS_REWARD_READY: 'OnBossRewardReady', // gancho p/ a escolha especial (Prompt 4)
  DIFFICULTY_CHANGED: 'OnDifficultyChanged',
});

export class EventBus {
  constructor() { this.h = new Map(); }
  on(name, fn) {
    if (!this.h.has(name)) this.h.set(name, []);
    this.h.get(name).push(fn);
    return () => this.off(name, fn);
  }
  off(name, fn) {
    const l = this.h.get(name);
    if (l) { const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); }
  }
  emit(name, payload) {
    const l = this.h.get(name);
    if (!l) return;
    for (let i = 0; i < l.length; i++) {
      try { l[i](payload); } catch (e) { console.error('[events]', name, e); } // UI quebrada não corrompe o combate
    }
  }
}
