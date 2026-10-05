// DADOS dos inimigos, bosses e da sequência de encontros + funções de escalamento.
// Para criar um inimigo novo: adicionar uma entrada aqui (e, se precisar, um comportamento em EnemyBehaviors.js).
import { CONFIG } from './config.js';
import { Enemy } from './Enemy.js';
import { BEHAVIORS } from './EnemyBehaviors.js';

const C = CONFIG.combat;

export const ENEMIES = {
  fragment: { id: 'fragment', name: 'FRAGMENTO', type: 'normal', baseHP: 15, baseReward: 10, breakMax: 8,
    behavior: 'none', visual: { color: '#38e8ff', scale: 1 } },
  parasite: { id: 'parasite', name: 'PARASITA', type: 'normal', baseHP: 40, baseReward: 30, breakMax: 10,
    behavior: 'parasite', params: { every: 3000, drain: 0.3 }, visual: { color: '#7cff6b', scale: 1 } },
  colossus: { id: 'colossus', name: 'COLOSSO', type: 'normal', baseHP: 220, baseReward: 150, breakMax: 30,
    behavior: 'colossus', params: { breakTaken: 0.5 }, visual: { color: '#ff9f43', scale: 1.15 } },
  mirror:   { id: 'mirror', name: 'ESPELHO', type: 'normal', baseHP: 55, baseReward: 45, breakMax: 12,
    behavior: 'mirror', params: { reflect: 3000, open: 1500, minMult: 0.25, openMult: 1.5, openBreak: 2 },
    visual: { color: '#c8d6ff', scale: 1 } },
  unstable: { id: 'unstable', name: 'INSTÁVEL', type: 'normal', baseHP: 60, baseReward: 50, breakMax: 10,
    behavior: 'unstable', params: { threshold: 0.25, fuse: 4000, healTo: 0.6, lock: 1200, rewardBonus: 3 },
    visual: { color: '#ff3d81', scale: 1 } },

  // Boss = mesmo Enemy + `phases`. hpBelow = fração de HP em que a fase COMEÇA.
  observer: { id: 'observer', name: 'O OBSERVADOR', type: 'boss', baseHP: 700, baseReward: 700, breakMax: 40,
    behavior: 'phased', spawnDelay: 900, visual: { color: '#b66bff', scale: 1.2 },
    phases: [
      { hpBelow: 1, name: 'FASE 1' },
      { hpBelow: 0.66, name: 'FASE 2', comboTimeoutScale: 0.85,
        gaze: { every: 6000, lock: 1500, vulnerable: 2500, vulnMult: 1.5, vulnBreak: 2 } },
      { hpBelow: 0.33, name: 'FASE 3', comboTimeoutScale: 0.6, regen: 0.015, regenDelay: 1200,
        gaze: { every: 4000, lock: 1800, vulnerable: 1800, vulnMult: 1.75, vulnBreak: 2.5 } },
    ] },
};

// Sequência de encontros (dados, não fluxo). Depois do último, repete a partir de `loopFrom` com tier+1.
export const ENCOUNTERS = {
  sequence: ['fragment', 'fragment', 'parasite', 'colossus', 'fragment', 'mirror', 'unstable', 'observer'],
  loopFrom: 0,
};
export function encounterAt(i) {
  const s = ENCOUNTERS.sequence, n = s.length;
  return i < n ? s[i] : s[ENCOUNTERS.loopFrom + (i - n) % (n - ENCOUNTERS.loopFrom)];
}

// Escalamento configurável: base × growth^(stage-1) × (1 + linear×(stage-1)) × tierMult^tier.
const scale = (k, stage, tier) =>
  Math.min(C.maxScale, Math.pow(k.growth, stage - 1) * (1 + k.linear * (stage - 1)) * Math.pow(k.tierMult, tier));
export const hpScale = (stage, tier = 0) => scale(C.hp, stage, tier);
export const rewardScale = (stage, tier = 0) => scale(C.reward, stage, tier);

export function createEnemy(id, stage, tier = 0) {
  const def = ENEMIES[id];
  if (!def) throw new Error('Inimigo desconhecido: ' + id);
  const e = new Enemy(def, {
    stage, tier,
    maxHP: Math.max(1, Math.round(def.baseHP * hpScale(stage, tier))),
    baseReward: def.baseReward * rewardScale(stage, tier),
    breakMax: Math.max(1, def.breakMax * (1 + C.breakScalePerStage * (stage - 1))),
  });
  e.behavior = BEHAVIORS[def.behavior] || {};
  return e;
}
