// Comportamentos = conjuntos de hooks. O inimigo escolhe um pelo nome (def.behavior) e passa parâmetros (def.params).
// Hooks (todos opcionais): onSpawn, update(e,dt,svc) [só quando o estado permite agir],
// onDamaged, onBreakStart, onPhase, onDefeat, damageMult(e,ctx), breakMult(e,ctx), rewardMult(e).
// svc = { combat, combo, stats, events, state }.
import { EVENTS } from './EventBus.js';

const fx = (s, e, kind) => s.events.emit(EVENTS.ENEMY_EFFECT, { enemy: e, kind });
const P = e => e.def.params;

export const BEHAVIORS = {
  none: {},

  // PARASITA: a cada `every` ms drena `drain` (fração) do combo atual.
  parasite: {
    update(e, dt, s) {
      e.mem.t = (e.mem.t || 0) + dt;
      if (e.mem.t >= P(e).every) { e.mem.t = 0; if (s.combo.drain(P(e).drain)) fx(s, e, 'drain'); }
    },
  },

  // COLOSSO: massa enorme; a barra de BREAK recebe só parte do dano de BREAK.
  colossus: { breakMult: e => P(e).breakTaken },

  // ESPELHO: alterna REFLETINDO (anula o ganho do seu combo) e ABERTO (vulnerável).
  mirror: {
    update(e, dt, s) {
      const p = P(e);
      e.mem.t = ((e.mem.t || 0) + dt) % (p.reflect + p.open);
      const st = e.mem.t >= p.reflect ? 'open' : 'reflect';
      if (e.status !== st) { e.status = st; fx(s, e, st); }
    },
    damageMult: (e, c) => e.status === 'open' ? P(e).openMult : Math.max(P(e).minMult, 1 / ((c && c.comboMult) || 1)),
    breakMult: e => e.status === 'open' ? P(e).openBreak : 1,
    onBreakStart(e) { e.status = null; },
  },

  // INSTÁVEL: perto da morte começa a "pavio"; se não morrer a tempo, explode (cura + zera o combo).
  // Recompensa cresce com o quão perto da morte o jogador o deixou sobreviver (menor HP% já atingido).
  unstable: {
    onSpawn(e) { e.mem.low = 1; e.mem.fuse = 0; },
    onDamaged(e) { if (e.currentHP > 0) e.mem.low = Math.min(e.mem.low ?? 1, e.hpRatio); },
    update(e, dt, s) {
      const p = P(e);
      if (e.hpRatio <= p.threshold) {
        e.status = 'critical';
        e.mem.fuse = (e.mem.fuse || 0) + dt;
        if (e.mem.fuse >= p.fuse) {
          e.mem.fuse = 0; e.status = null;
          s.combat.heal(e, Math.ceil(e.maxHP * p.healTo - e.currentHP));
          e.mem.low = e.hpRatio;
          s.combo.interrupt(p.lock);
          fx(s, e, 'blast');
        }
      } else { e.status = null; e.mem.fuse = 0; }
    },
    onBreakStart(e) { e.status = null; e.mem.fuse = 0; },
    rewardMult: e => 1 + P(e).rewardBonus * (1 - (e.mem.low ?? 1)),
  },

  // BOSS EM FASES: lê def.phases[phase-1]. Parâmetros por fase:
  //  comboTimeoutScale  → altera a velocidade do combate
  //  gaze {every,lock,vulnerable,vulnMult,vulnBreak} → interrompe o combo e depois abre janela de vulnerabilidade
  //  regen (fração do HP máx/s) após regenDelay ms sem receber dano
  phased: {
    onSpawn(e) { e.mem = {}; },
    onPhase(e, s) {
      const ph = e.phaseDef;
      s.combo.timeoutScale = ph.comboTimeoutScale ?? 1;
      s.combo.unlock();
      e.mem.t = 0; e.mem.g = 0; e.mem.v = 0; e.mem.acc = 0;
      e.status = null;
    },
    onDamaged(e) { e.mem.idle = 0; },
    onBreakStart(e, s) { e.status = null; e.mem.t = 0; s.combo.unlock(); }, // BREAK cancela o olhar
    onDefeat(e, s) { e.status = null; s.combo.timeoutScale = 1; },
    update(e, dt, s) {
      const ph = e.phaseDef, m = e.mem, g = ph.gaze;
      m.idle = (m.idle || 0) + dt;
      if (ph.regen && m.idle >= (ph.regenDelay ?? 1200) && e.status !== 'vulnerable') {
        m.acc = (m.acc || 0) + e.maxHP * ph.regen * dt / 1000;
        const w = Math.floor(m.acc);
        if (w >= 1) { m.acc -= w; s.combat.heal(e, w); }
      }
      if (!g) return;
      if (e.status === 'gaze') {
        m.g -= dt;
        if (m.g <= 0) { e.status = 'vulnerable'; m.v = g.vulnerable; fx(s, e, 'vulnerable'); }
      } else if (e.status === 'vulnerable') {
        m.v -= dt;
        if (m.v <= 0) { e.status = null; m.t = 0; }
      } else {
        m.t = (m.t || 0) + dt;
        if (m.t >= g.every) { e.status = 'gaze'; m.g = g.lock; s.combo.interrupt(g.lock); fx(s, e, 'gaze'); }
      }
    },
    damageMult: e => e.status === 'vulnerable' ? e.phaseDef.gaze.vulnMult : 1,
    breakMult: e => e.status === 'vulnerable' ? e.phaseDef.gaze.vulnBreak : 1,
  },
};
