import { GameState } from './GameState.js';
import { StatSystem } from './StatSystem.js';
import { DamageSystem } from './DamageSystem.js';
import { CurrencySystem } from './CurrencySystem.js';
import { ComboSystem } from './ComboSystem.js';
import { UIManager } from './UIManager.js';
import { FeedbackSystem } from './FeedbackSystem.js';
import { RunManager } from './RunManager.js';
import { ClickSystem } from './ClickSystem.js';
import { MetaSystem } from './MetaSystem.js';
import { LootSystem } from './LootSystem.js';
import { UpgradeSystem } from './UpgradeSystem.js';
import { MilestoneSystem } from './MilestoneSystem.js';
// Etapa 3
import { CONFIG } from './config.js';
import { EventBus } from './EventBus.js';
import { CombatSystem } from './CombatSystem.js';
import { EncounterManager } from './EncounterManager.js';
import { CombatUI } from './CombatUI.js';
import { AudioFX } from './AudioFX.js';

const state = new GameState();
const core = document.getElementById('core');
const events = new EventBus();
const stats = new StatSystem(state);
const ui = new UIManager(state, stats);
const loot = new LootSystem(state, stats);
const combo = new ComboSystem(state, stats);
const currency = new CurrencySystem(state);
const combat = new CombatSystem(state, { combo, stats, events });
const sys = {
  stats, ui, loot, events, combo, currency, combat,
  target: combat, // alias: o "alvo" agora é o inimigo atual (mantém a interface takeDamage)
  encounters: new EncounterManager(state, { combat, currency, events }),
  meta: new MetaSystem(state),
  damage: new DamageSystem(state, stats),
  milestones: new MilestoneSystem(),
  upgrades: new UpgradeSystem(state, stats, loot, ui),
  feedback: new FeedbackSystem(core, document.getElementById('floaters'), document.getElementById('fx')),
};
const runManager = new RunManager(state, sys);
const clicker = new ClickSystem(state, sys);
const audio = new AudioFX();
const combatUI = new CombatUI({ events, state, combat, feedback: sys.feedback, audio });

core.addEventListener('pointerdown', e => {
  audio.ensure();
  if (e.button === 0 || e.pointerType !== 'mouse') clicker.processClick(e.clientX, e.clientY);
});
addEventListener('keydown', e => {
  if (e.code === 'Space' && !e.repeat && state.run.isRunActive) { e.preventDefault(); audio.ensure(); clicker.processClick(); }
});

// Encerrar run (a run não termina mais quando o alvo morre): confirmação em 2 toques.
const retreat = document.getElementById('retreat');
let armedAt = 0;
retreat.addEventListener('click', () => {
  if (!state.run.isRunActive) return;
  const t = performance.now();
  if (armedAt && t - armedAt < 2500) { armedAt = 0; retreat.textContent = 'Encerrar run'; runManager.endRun(); return; }
  armedAt = t; retreat.textContent = 'Confirmar?';
  setTimeout(() => { if (armedAt === t) { armedAt = 0; retreat.textContent = 'Encerrar run'; } }, 2500);
  retreat.blur();
});

// Loop leve: dt do combate é 0 enquanto pausado; congela o relógio do combo.
let last = performance.now(), lastRender = 0;
(function tick(now) {
  const run = state.run;
  const dt = run.isPaused ? 0 : Math.min(now - last, CONFIG.combat.maxDt);
  last = now;
  const t = run.isPaused ? run.pausedAt : now;
  if (run.isRunActive) { combat.update(dt); sys.encounters.update(dt); }
  let redraw = sys.combo.update(t);
  if (combat.dirty && now - lastRender > 80) { combat.dirty = false; lastRender = now; redraw = true; } // regen, spawn, cura
  if (redraw) ui.render();
  ui.renderComboTimer(sys.combo.timeRatio(t));
  combatUI.render();
  requestAnimationFrame(tick);
})(performance.now());

ui.render();
runManager.showHub();
