import { CONFIG } from './config.js';
import { EnemyState as S } from './Enemy.js';
import { EVENTS } from './EventBus.js';
import { BossSystem } from './BossSystem.js';

const K = CONFIG.combat;

// Dono do inimigo atual: estados, HP, BREAK, timers. Não conhece UI nem recompensa.
// Espelha HP em state.run.currentHP/maxHP para o que já lê isso (UIManager, upgrades lowHP/highHP).
export class CombatSystem {
  constructor(state, { combo, stats, events }) {
    this.state = state; this.combo = combo; this.stats = stats; this.events = events;
    this.enemy = null;
    this.dirty = false; // mudança fora de clique → o loop pede ui.render()
    this.svc = { combat: this, combo, stats, events, state };
    this.boss = new BossSystem(this);
    this._dmg = { enemy: null, amount: 0 }; // payload reutilizado (sem alocar por clique)
  }

  // ---- consultas ----
  canAttack() { return !!this.enemy && this.enemy.rules.canTakeDamage; }
  get isBreaking() { return !!this.enemy && this.enemy.state === S.BREAKING; }
  effectBoost() { return this.isBreaking ? K.breakEffectBoost : 1; } // "efeitos mais fortes" no BREAK

  // ---- ciclo de vida ----
  reset() { this.clear(); }
  clear() { this.enemy = null; this.combo.clearModifiers(); this.dirty = true; }
  spawn(e) {
    this.enemy = e;
    e.state = S.SPAWNING;
    e.timer = e.def.spawnDelay ?? K.spawnDelay;
    this.sync(); this.dirty = true;
    if (e.behavior.onSpawn) e.behavior.onSpawn(e, this.svc);
    if (e.isBoss) this.boss.init(e);
    this.events.emit(EVENTS.ENEMY_SPAWNED, { enemy: e });
  }
  activate(e) { e.state = S.ACTIVE; this.events.emit(EVENTS.ENEMY_ACTIVE, { enemy: e }); }
  sync() { const e = this.enemy, r = this.state.run; if (e) { r.maxHP = e.maxHP; r.currentHP = e.currentHP; } }

  // ---- dano ao HP (ApplyDamage chega aqui) ----
  dealDamage(amount) {
    const e = this.enemy;
    if (!e || !e.rules.canTakeDamage || !(amount > 0)) return 0; // morto/spawning não recebe dano
    const dealt = Math.min(amount, e.currentHP);
    e.currentHP -= dealt;
    this.sync();
    if (e.behavior.onDamaged) e.behavior.onDamaged(e, dealt, this.svc);
    this._dmg.enemy = e; this._dmg.amount = dealt;
    this.events.emit(EVENTS.ENEMY_DAMAGED, this._dmg);
    if (e.currentHP <= 0) this.defeat(e);
    else if (e.isBoss) this.boss.checkPhase(e); // se morreu, não há transição de fase
    return dealt;
  }
  takeDamage(n) { return this.dealDamage(n); } // compatibilidade com o antigo TargetSystem

  // ---- dano de BREAK (ApplyBreakDamage chega aqui; não toca no HP) ----
  dealBreakDamage(amount) {
    const e = this.enemy;
    if (!e || !e.rules.canBeBroken || !(amount > 0)) return 0;
    e.breakCurrent = Math.max(0, e.breakCurrent - amount);
    if (e.breakCurrent <= 0) this.startBreak(e);
    return amount;
  }
  startBreak(e) {
    e.state = S.BREAKING;
    e.breakTimer = K.breakDuration;
    e.breakCount++;
    this.state.run.totalBreaks++;
    if (e.behavior.onBreakStart) e.behavior.onBreakStart(e, this.svc);
    this.events.emit(EVENTS.BREAK_STARTED, { enemy: e, duration: K.breakDuration });
  }
  endBreak(e) {
    e.state = S.ACTIVE;
    e.breakTimer = 0;
    e.breakMax = e.breakMax * K.breakGrowth;
    e.breakCurrent = e.breakMax * K.breakRestore;
    this.events.emit(EVENTS.BREAK_ENDED, { enemy: e, interrupted: false });
  }

  heal(e, amount) {
    if (!e || e.state === S.DEFEATED || !(amount > 0)) return 0;
    const h = Math.min(e.maxHP - e.currentHP, Math.ceil(amount));
    if (h <= 0) return 0;
    e.currentHP += h; this.sync(); this.dirty = true;
    return h;
  }

  // Idempotente: só a primeira chamada tem efeito (garante recompensa única).
  defeat(e) {
    if (e.state === S.DEFEATED) return false;
    const wasBreaking = e.state === S.BREAKING;
    e.state = S.DEFEATED;
    e.currentHP = 0; e.breakTimer = 0; e.status = null;
    this.sync();
    if (e.behavior.onDefeat) e.behavior.onDefeat(e, this.svc);
    this.combo.clearModifiers();
    if (wasBreaking) this.events.emit(EVENTS.BREAK_ENDED, { enemy: e, interrupted: true });
    this.events.emit(EVENTS.ENEMY_DEFEATED, { enemy: e });
    return true;
  }

  // dt em ms, já 0 quando pausado.
  update(dt) {
    this.combo.tickLock(dt);
    const e = this.enemy;
    if (!e || !(dt > 0)) return;
    if (e.state === S.SPAWNING) { e.timer -= dt; if (e.timer <= 0) this.activate(e); return; }
    if (e.state === S.BREAKING) { e.breakTimer -= dt; if (e.breakTimer <= 0) this.endBreak(e); return; }
    if (e.rules.behaves) {
      e.time += dt;
      if (e.behavior.update) e.behavior.update(e, dt, this.svc);
    }
  }
}
