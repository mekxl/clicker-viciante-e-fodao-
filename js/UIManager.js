export class UIManager {
  constructor(state) {
    this.state = state;
    const $ = id => document.getElementById(id);
    this.el = {
      hpFill: $('hpFill'), hpText: $('hpText'), energy: $('energy'), damage: $('damage'),
      combo: $('combo'), comboCount: $('comboCount'), clicks: $('clicks'),
      comboFill: $('comboFill'), overlay: $('overlay'), msg: $('overlayMsg'), btn: $('startBtn'),
    };
  }
  render() {
    const r = this.state.run, e = this.el;
    e.hpFill.style.transform = `scaleX(${r.currentHP / r.maxHP})`;
    e.hpText.textContent = `${r.currentHP} / ${r.maxHP}`;
    e.energy.textContent = r.energy;
    e.damage.textContent = r.damagePerClick;
    e.combo.textContent = 'x' + r.comboMultiplier;
    e.comboCount.textContent = r.currentCombo;
    e.clicks.textContent = r.totalClicks;
  }
  renderComboTimer(ratio) { this.el.comboFill.style.transform = `scaleX(${ratio})`; }
  hideOverlay() { this.el.overlay.classList.add('hidden'); }
  showEnd() {
    const r = this.state.run;
    this.el.msg.textContent = `CORE destruído!\nCliques: ${r.totalClicks} · Combo máx: ${r.maxCombo} · Energia: ${r.energy}`;
    this.el.btn.textContent = 'Restart run';
    this.el.overlay.classList.remove('hidden');
    this.el.btn.focus();
  }
}
