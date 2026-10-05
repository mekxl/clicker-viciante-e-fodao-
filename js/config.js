// Valores de balanceamento centralizados.
export const CONFIG = {
  maxHP: 2000, // agora é o HP do CORE do jogador (reservado p/ ataques inimigos futuros)
  damagePerClick: 1,
  energyPerClick: 1,
  comboTimeout: 1500,
  comboTiers: [{ min: 50, mult: 4 }, { min: 25, mult: 3 }, { min: 10, mult: 2 }, { min: 0, mult: 1 }],
  milestones: [30, 80, 150, 250, 400, 600, 850, 1150, 1500, 2000], // cliques que geram escolha
  overloadDuration: 3000,
  choiceCount: 3,
  lowHPThreshold: 0.3,
  highHPThreshold: 0.9,
  maxFloaters: 40,
  maxParticles: 150,
  reward: { perClick: 0.05, perSqrtDamage: 0.5, perMilestone: 4, perCombo: 0.1, perEnemy: 1, perBoss: 15 },

  // ---- Etapa 3: combate ----
  combat: {
    spawnDelay: 350,        // ms em SPAWNING (não recebe dano)
    defeatDelay: 700,       // ms entre a morte e o próximo encontro
    bossDefeatDelay: 1600,
    maxDt: 100,             // teto de dt por frame (aba em segundo plano não "acelera" o jogo)
    // BREAK
    breakDamagePerClick: 1, // base do stat 'breakDamage' (× multiplicador de combo)
    breakDuration: 4000,    // ms de BREAK
    breakDamageMult: 2,     // multiplicador de dano do HP durante BREAK (fornecido pelo ESTADO)
    breakRestore: 1,        // fração da barra restaurada ao sair do BREAK (1 = cheia)
    breakGrowth: 1.15,      // a barra fica 15% maior a cada BREAK do mesmo inimigo
    breakEffectBoost: 1.5,  // × chance de repetição de golpe durante BREAK
    breakScalePerStage: 0.08,
    // Escalamento: valor = base × growth^(stage-1) × (1 + linear×(stage-1)) × tierMult^tier
    hp:     { growth: 1.16, linear: 0.15, tierMult: 6 },
    reward: { growth: 1.12, linear: 0,    tierMult: 3 },
    maxScale: 1e300,        // evita Infinity/NaN em runs absurdamente longas
  },
  saveKey: 'breakcore.meta.v1',
};
export const RARITY = { // peso relativo de sorteio
  common:    { label: 'Comum',    weight: 60 },
  uncommon:  { label: 'Incomum',  weight: 28 },
  rare:      { label: 'Raro',     weight: 9 },
  epic:      { label: 'Épico',    weight: 2.5 },
  legendary: { label: 'Lendário', weight: 0.5 },
};
