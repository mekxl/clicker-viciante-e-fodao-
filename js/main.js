import { GameState } from './GameState.js';
import { StatSystem } from './StatSystem.js';
import { DamageSystem } from './DamageSystem.js';
import { CurrencySystem } from './CurrencySystem.js';
import { ComboSystem } from './ComboSystem.js';
import { TargetSystem } from './TargetSystem.js';
import { UIManager } from './UIManager.js';
import { FeedbackSystem } from './FeedbackSystem.js';
import { RunManager } from './RunManager.js';
import { ClickSystem } from './ClickSystem.js';
import { MetaSystem } from './MetaSystem.js';
import { LootSystem } from './LootSystem.js';
import { UpgradeSystem } from './UpgradeSystem.js';
import { MilestoneSystem } from './MilestoneSystem.js';

const state = new GameState();
const core = document.getElementById('core');
const stats = new StatSystem(state);
const ui = new UIManager(state, stats);
const loot = new LootSystem(state, stats);
const sys = {
  stats, ui, loot,
  meta: new MetaSystem(state),
  damage: new DamageSystem(state, stats),
  currency: new CurrencySystem(state),
  combo: new ComboSystem(state, stats),
  target: new TargetSystem(state),
  milestones: new MilestoneSystem(),
  upgrades: new UpgradeSystem(state, stats, loot, ui),
  feedback: new FeedbackSystem(core, document.getElementById('floaters'), document.getElementById('fx')),
};
const runManager = new RunManager(state, sys);
const clicker = new ClickSystem(state, sys);

core.addEventListener('pointerdown', e => {
  if (e.button === 0 || e.pointerType !== 'mouse') clicker.processClick(e.clientX, e.clientY);
});
addEventListener('keydown', e => {
  if (e.code === 'Space' && !e.repeat && state.run.isRunActive) { e.preventDefault(); clicker.processClick(); }
});

// Loop leve; congela o relógio do combo enquanto pausado.
(function tick(now) {
  const t = state.run.isPaused ? state.run.pausedAt : now;
  if (sys.combo.update(t)) ui.render();
  ui.renderComboTimer(sys.combo.timeRatio(t));
  requestAnimationFrame(tick);
})(performance.now());

ui.render();
runManager.showHub();
