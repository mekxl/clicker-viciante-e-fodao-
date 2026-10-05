import { UPGRADES_BY_ID } from './upgrades.js';
import { META_UPGRADES } from './metaUpgrades.js';
import { RARITY } from './config.js';

const fmt = n => Math.round(n).toLocaleString('pt-BR');
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'];

export class UIManager {
  constructor(state, stats) {
    this.state = state; this.stats = stats;
    const $ = id => document.getElementById(id);
    this.el = { hpFill: $('hpFill'), hpText: $('hpText'), energy: $('energy'), damage: $('damage'),
      combo: $('combo'), comboCount: $('comboCount'), clicks: $('clicks'), comboFill: $('comboFill'),
      overlay: $('overlay'), panel: $('panel'), choice: $('choice'), cards: $('cards'), build: $('build') };
    this.keyHandler = null;
  }
  render() {
    const r = this.state.run, e = this.el;
    e.hpFill.style.transform = `scaleX(${r.currentHP / r.maxHP})`;
    e.hpText.textContent = `${fmt(r.currentHP)} / ${fmt(r.maxHP)}`;
    e.energy.textContent = fmt(r.energy);
    e.damage.textContent = fmt(this.stats.get('damage', this.stats.context(performance.now())) * r.comboMultiplier);
    e.combo.textContent = 'x' + r.comboMultiplier;
    e.comboCount.textContent = r.currentCombo;
    e.clicks.textContent = fmt(r.totalClicks);
  }
  renderBuild() {
    this.el.build.innerHTML = Object.entries(this.state.run.upgrades).map(([id, n]) => {
      const u = UPGRADES_BY_ID[id];
      return `<span class="chip" data-r="${u.rarity}" title="${u.name}: ${u.description}">${u.icon}${n > 1 ? `<sup>${n}</sup>` : ''}</span>`;
    }).join('');
  }
  renderComboTimer(ratio) { this.el.comboFill.style.transform = `scaleX(${ratio})`; }

  showChoices(options, owned, onPick) {
    let picked = false;
    const pick = (i) => {
      if (picked || !options[i]) return; picked = true;
      [...this.el.cards.children].forEach((c, j) => c.classList.add(j === i ? 'picked' : 'gone'));
      removeEventListener('keydown', this.keyHandler);
      setTimeout(() => onPick(options[i].id), 320);
    };
    this.el.cards.innerHTML = options.map((u, i) => {
      const n = owned[u.id] || 0;
      return `<button class="card" data-i="${i}" data-r="${u.rarity}">
        <span class="icon">${u.icon}</span><b>${u.name}${n ? ' ' + (ROMAN[n + 1] || n + 1) : ''}</b>
        <em>${RARITY[u.rarity].label}</em><span class="desc">${u.description}</span>
        <small>${u.tags.join(' · ')}</small></button>`;
    }).join('');
    this.el.cards.onclick = e => { const c = e.target.closest('.card'); if (c) pick(+c.dataset.i); };
    this.keyHandler = e => { if (['Digit1', 'Digit2', 'Digit3'].includes(e.code)) pick(+e.code.slice(5) - 1); };
    addEventListener('keydown', this.keyHandler);
    this.el.choice.classList.remove('hidden');
  }
  hideChoices() {
    this.el.choice.classList.add('hidden');
    if (this.keyHandler) removeEventListener('keydown', this.keyHandler);
  }
  hideOverlay() { this.el.overlay.classList.add('hidden'); }

  showEnd(s, onContinue) {
    this.el.panel.innerHTML = `<h1>RUN TERMINADA</h1>
      <ul class="sum"><li>Cliques: <b>${fmt(s.clicks)}</b></li><li>Dano causado: <b>${fmt(s.damage)}</b></li>
      <li>Maior combo: <b>${fmt(s.maxCombo)}</b></li><li>Upgrades obtidos: <b>${s.upgrades}</b></li></ul>
      <p class="frag">Fragmentos ganhos<br><strong>+${fmt(s.reward)}</strong></p>
      <button data-act="go">Continuar</button>`;
    this.el.panel.onclick = e => { if (e.target.dataset.act) onContinue(); };
    this.el.overlay.classList.remove('hidden');
    this.el.panel.querySelector('button').focus();
  }
  showHub(meta, { onStart, onBuy }) {
    const items = META_UPGRADES.map(d => {
      const lv = meta.level(d.id), max = lv >= d.maxLevel;
      return `<button class="shop" data-buy="${d.id}" ${max || !meta.canBuy(d) ? 'disabled' : ''}>
        <b>${d.name} <i>${lv}/${d.maxLevel}</i></b><span>${d.description}</span>
        <em>${max ? 'MÁX' : '◆ ' + fmt(meta.cost(d))}</em></button>`;
    }).join('');
    this.el.panel.innerHTML = `<h1>BREAK//CORE</h1>
      <p class="frag">◆ <strong>${fmt(meta.m.fragments)}</strong> Fragmentos do Vazio</p>
      <div class="shops">${items}</div><button data-act="go">Start run</button>`;
    this.el.panel.onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.buy) onBuy(b.dataset.buy); else if (b.dataset.act) onStart();
    };
    this.el.overlay.classList.remove('hidden');
  }
}
