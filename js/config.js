// Valores de balanceamento centralizados.
export const CONFIG = {
  maxHP: 300,
  damagePerClick: 1,
  energyPerClick: 1,
  comboTimeout: 1500, // ms sem clicar para zerar o combo
  comboTiers: [       // do maior para o menor
    { min: 50, mult: 4 },
    { min: 25, mult: 3 },
    { min: 10, mult: 2 },
    { min: 0,  mult: 1 },
  ],
  maxFloaters: 40,
  maxParticles: 150,
};
