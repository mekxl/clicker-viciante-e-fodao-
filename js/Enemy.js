import { CONFIG } from './config.js';

export const EnemyState = Object.freeze({
  SPAWNING: 'SPAWNING', ACTIVE: 'ACTIVE', BREAKING: 'BREAKING', DEFEATED: 'DEFEATED',
  // Futuro: ENRAGED, INVULNERABLE, PHASE_CHANGE → basta adicionar uma linha em STATE_RULES.
});

const K = CONFIG.combat;
// O ESTADO decide o que é permitido e fornece o modificador de dano.
// Nenhum outro sistema deve fazer "if (enemy.breaking) dano *= 2".
export const STATE_RULES = Object.freeze({
  SPAWNING: { canTakeDamage: false, canBeBroken: false, behaves: false, damageMult: () => 1 },
  ACTIVE:   { canTakeDamage: true,  canBeBroken: true,  behaves: true,  damageMult: () => 1 },
  BREAKING: { canTakeDamage: true,  canBeBroken: false, behaves: false, damageMult: () => K.breakDamageMult },
  DEFEATED: { canTakeDamage: false, canBeBroken: false, behaves: false, damageMult: () => 1 },
});

// Estrutura base única. Tudo que diferencia um inimigo vem de `def` (dados) + `behavior` (hooks).
export class Enemy {
  constructor(def, v) {
    this.def = def;
    this.id = def.id; this.name = def.name; this.type = def.type;
    this.isBoss = def.type === 'boss';
    this.stage = v.stage; this.tier = v.tier;
    this.maxHP = this.currentHP = v.maxHP;
    this.baseReward = v.baseReward;
    this.breakMax = this.breakCurrent = v.breakMax;
    this.state = EnemyState.SPAWNING;
    this.behavior = {};          // preenchido pela fábrica
    this.mem = {};               // memória privada do comportamento
    this.status = null;          // rótulo visual/funcional ('reflect','open','gaze','vulnerable','critical')
    this.phase = 1;
    this.timer = 0;              // SPAWNING
    this.breakTimer = 0;         // BREAKING
    this.breakCount = 0;
    this.time = 0;               // ms ativos
    this.rewardClaimed = false;
  }
  get rules() { return STATE_RULES[this.state]; }
  get hpRatio() { return this.maxHP > 0 ? this.currentHP / this.maxHP : 0; }
  get phaseDef() { return this.def.phases ? this.def.phases[this.phase - 1] : null; }
  // Modificadores que o DamageSystem consulta:
  damageTakenMult(ctx) { return this.rules.damageMult() * (this.behavior.damageMult ? this.behavior.damageMult(this, ctx) : 1); }
  breakTakenMult(ctx) { return this.behavior.breakMult ? this.behavior.breakMult(this, ctx) : 1; }
  rewardMult() { return this.behavior.rewardMult ? this.behavior.rewardMult(this) : 1; }
}
