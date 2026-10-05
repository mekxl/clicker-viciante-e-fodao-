// Progressão permanente (gasta Fragmentos do Vazio).
export const META_UPGRADES = [
  { id: 'startDamage', name: 'Dano inicial', description: '+1 de dano base por nível', maxLevel: 10, baseCost: 20, effects: [{ stat: 'damage', type: 'add', value: 1 }] },
  { id: 'reserve', name: 'Reserva', description: 'Começa a run com +25 de energia por nível', maxLevel: 10, baseCost: 15, effects: [{ stat: 'startEnergy', type: 'add', value: 25 }] },
  { id: 'fortune', name: 'Fortuna', description: 'Raridades melhores ficam 25% mais prováveis por nível', maxLevel: 5, baseCost: 40, effects: [{ stat: 'luck', type: 'add', value: 1 }] },
  { id: 'endurance', name: 'Resistência', description: '+10% de HP máximo do CORE por nível (run mais longa)', maxLevel: 10, baseCost: 30, effects: [{ stat: 'maxHP', type: 'mult', value: 0.1 }] },
  { id: 'knowledge', name: 'Conhecimento', description: 'Cada opção é sorteada +1 vez e fica a melhor (por nível)', maxLevel: 3, baseCost: 60, effects: [{ stat: 'quality', type: 'add', value: 1 }] },
];
