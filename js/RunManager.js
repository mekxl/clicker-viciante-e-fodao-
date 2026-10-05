export class RunManager {
  constructor(state, { target, currency, combo, feedback, ui }) {
    Object.assign(this, { state, target, currency, combo, feedback, ui });
    this.target.onDeath = () => this.endRun();
  }
  startRun() {
    this.state.resetRun();     // reseta HP, cliques, combo, multiplicadores...
    this.currency.reset();
    this.combo.reset();
    this.target.reset();
    this.feedback.clear();
    this.state.run.isRunActive = true;
    this.ui.render();
    this.ui.renderComboTimer(0);
    this.ui.hideOverlay();
  }
  endRun() {
    if (!this.state.run.isRunActive) return;
    this.state.run.isRunActive = false;
    this.feedback.death();
    this.ui.render();
    this.ui.showEnd();
  }
  restartRun() { this.startRun(); }
}
