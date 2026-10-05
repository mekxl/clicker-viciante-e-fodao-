// DADOS dos upgrades (sem lógica). Efeitos são declarativos; StatSystem os interpreta.
// scale: 'combo' | 'energy10' | 'tag:X'   cond: 'lowHP' | 'highHP' | 'overload'
const E = (stat, type, value, extra = {}) => ({ stat, type, value, ...extra });
const U = (id, name, description, rarity, icon, tags, stackLimit, effects, requires) =>
  ({ id, name, description, rarity, icon, tags, stackLimit, effects, requires });

export const UPGRADES = [
  U('heavy_hand', 'Mão Pesada', '+2 de dano base', 'common', '✊', ['CLICK'], 5, [E('damage', 'add', 2)]),
  U('thirst', 'Sedenta', '+50% de dano por clique', 'uncommon', '🩸', ['CLICK'], 3, [E('damage', 'mult', 0.5)]),
  U('reflex', 'Reflexo', '+10% de chance de repetir o golpe', 'uncommon', '⚡', ['CLICK'], 5, [E('repeatChance', 'add', 0.1)]),
  U('catalyst', 'Catalisador', '+25% de energia por clique', 'common', '⚗️', ['ENERGY'], 5, [E('energy', 'mult', 0.25)]),
  U('siphon', 'Sifão', '+1 de energia por clique', 'common', '🌀', ['ENERGY'], 5, [E('energy', 'add', 1)]),
  U('momentum', 'Impulso', 'O combo dura 30% mais', 'common', '🔥', ['COMBO'], 4, [E('comboTimeout', 'mult', 0.3)]),
  U('overload', 'Sobrecarga', 'A cada 25 cliques, dano x2 por 3s', 'rare', '💥', ['COMBO'], 1,
    [E('overloadEvery', 'add', 25), E('damage', 'mult', 1, { cond: 'overload' })]),
  U('visceral', 'Combo Visceral', '+1% de dano por ponto de combo', 'rare', '🧬', ['COMBO'], 3, [E('damage', 'mult', 0.01, { scale: 'combo' })]),
  U('rupture', 'Ruptura', '+100% de dano com o alvo abaixo de 30% de HP', 'uncommon', '🗡️', ['BREAK'], 3, [E('damage', 'mult', 1, { cond: 'lowHP' })]),
  U('primer', 'Primeiro Golpe', '+150% de dano com o alvo acima de 90% de HP', 'uncommon', '🎯', ['BREAK'], 2, [E('damage', 'mult', 1.5, { cond: 'highHP' })]),
  U('wellspring', 'Fonte', '+1% de energia por ponto de combo', 'rare', '💧', ['ENERGY', 'COMBO'], 2, [E('energy', 'mult', 0.01, { scale: 'combo' })]),
  U('overflow', 'Transbordo', '+2% de dano a cada 10 de energia guardada', 'rare', '🌊', ['ENERGY'], 3, [E('damage', 'mult', 0.02, { scale: 'energy10' })]),
  U('gambler', 'Apostador', '+100% de dano, mas o combo dura 30% menos', 'epic', '🎲', ['RISK'], 1,
    [E('damage', 'mult', 1), E('comboTimeout', 'mult', -0.3)]),
  U('resonance', 'Ressonância', '+15% de dano por upgrade COMBO que você tem', 'epic', '🔔', ['SYNERGY'], 1,
    [E('damage', 'mult', 0.15, { scale: 'tag:COMBO' })], { tag: 'COMBO', count: 1 }),
  U('singularity', 'Singularidade', 'Todo o dano x1,5', 'legendary', '🕳️', ['CLICK'], 1, [E('damage', 'more', 0.5)]),
];
export const UPGRADES_BY_ID = Object.fromEntries(UPGRADES.map(u => [u.id, u]));
