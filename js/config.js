// Valores de balanceamento centralizados.
export const CONFIG = {
  maxHP: 2000,
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
  reward: { perClick: 0.05, perSqrtDamage: 0.5, perMilestone: 4, perCombo: 0.1 },
  saveKey: 'breakcore.meta.v1',
};
export const RARITY = { // peso relativo de sorteio
  common:    { label: 'Comum',    weight: 60 },
  uncommon:  { label: 'Incomum',  weight: 28 },
  rare:      { label: 'Raro',     weight: 9 },
  epic:      { label: 'Épico',    weight: 2.5 },
  legendary: { label: 'Lendário', weight: 0.5 },
};
