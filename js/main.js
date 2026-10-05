import { GameState } from './GameState.js';
import { DamageSystem } from './DamageSystem.js';
import { CurrencySystem } from './CurrencySystem.js';
import { ComboSystem } from './ComboSystem.js';
import { TargetSystem } from './TargetSystem.js';
import { UIManager } from './UIManager.js';
import { FeedbackSystem } from './FeedbackSystem.js';
import { RunManager } from './RunManager.js';
import { ClickSystem } from './ClickSystem.js';

const state = new GameState();
const core = document.getElementById('core');
const sys = {
  damage: new DamageSystem(state),
  currency: new CurrencySystem(state),
  combo: new ComboSystem(state),
  target: new TargetSystem(state),
  ui: new UIManager(state),
  feedback: new FeedbackSystem(core, document.getElementById('floaters'), document.getElementById('fx')),
};
const runManager = new RunManager(state, sys);
const clicker = new ClickSystem(state, sys);

core.addEventListener('pointerdown', e => {
  if (e.button === 0 || e.pointerType !== 'mouse') clicker.processClick(e.clientX, e.clientY);
});
addEventListener('keydown', e => {
  if (e.code === 'Space' && !e.repeat && state.run.isRunActive) {
    e.preventDefault();
    clicker.processClick();
  }
});
sys.ui.el.btn.addEventListener('click', () => runManager.restartRun());

// Loop leve: só expira o combo e anima a barra de tempo.
(function tick(now) {
  if (sys.combo.update(now)) sys.ui.render();
  sys.ui.renderComboTimer(sys.combo.timeRatio(now));
  requestAnimationFrame(tick);
})(performance.now());

sys.ui.render();
