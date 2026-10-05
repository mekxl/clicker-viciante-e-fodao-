import { CONFIG } from './config.js';
import { EVENTS } from './EventBus.js';
import { EnemyState as S } from './Enemy.js';
import { fmt } from './format.js';

const K = CONFIG.combat;
const EFFECT_TEXT = { drain: 'COMBO ↓', gaze: 'OLHAR!', vulnerable: 'VULNERÁVEL', open: 'ABERTO', blast: 'INSTÁVEL!' };

// Só apresentação: escuta eventos do combate. Nenhuma regra de jogo mora aqui.
export class CombatUI {
  constructor({ events, state, combat, feedback, audio }) {
    const $ = id => document.getElementById(id);
    this.state = state; this.combat = combat; this.fb = feedback; this.audio = audio;
    this.el = { core: $('core'), stage: $('stage'), name: $('enemyName'), brk: $('breakFill'),
      brkLabel: $('breakLabel'), info: $('encounterInfo'), flash: $('flash'), banner: $('banner') };
    this.root = document.documentElement;
    this.calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.cache = {};

    events.on(EVENTS.ENEMY_SPAWNED, ({ enemy }) => this.onSpawn(enemy));
    events.on(EVENTS.BREAK_STARTED, () => this.onBreakStart());
    events.on(EVENTS.BREAK_ENDED, () => { this.root.classList.remove('break-mode'); this.audio.breakEnd(); });
    events.on(EVENTS.ENEMY_DEFEATED, ({ enemy }) => this.onDefeat(enemy));
    events.on(EVENTS.ENCOUNTER_ENDED, ({ reward }) => {
      const m = this.fb.center();
      this.fb.floater('+' + fmt(reward) + ' ⚡', m.x, m.y - m.r * 0.7);
    });
    events.on(EVENTS.BOSS_PHASE_CHANGED, ({ to }) => {
      this.banner('FASE ' + to, 900); this.flash('#ff3d81', 260); this.shake(14, 320); this.audio.phase();
      const m = this.fb.center(); this.fb.burst(m.x, m.y, 40, 6);
    });
    events.on(EVENTS.ENEMY_EFFECT, ({ kind }) => {
      const t = EFFECT_TEXT[kind]; if (!t) return;
      const m = this.fb.center(); this.fb.floater(t, m.x, m.y - m.r * 1.05);
      if (kind !== 'drain') this.audio.cue();
    });
    events.on(EVENTS.RUN_ENDED, () => { this.root.classList.remove('break-mode'); this.audio.breakEnd(); });
    events.on(EVENTS.RUN_STARTED, () => { this.cache = {}; this.root.classList.remove('break-mode'); });
  }

  // ---- efeitos rápidos (WAAPI, não bloqueiam cliques: pointer-events:none) ----
  banner(text, ms = 700, small = false) {
    const b = this.el.banner; b.textContent = text; b.classList.toggle('small', small);
    b.animate([{ opacity: 0, transform: 'scale(2)' }, { opacity: 1, transform: 'scale(1)', offset: 0.18 },
      { opacity: 1, transform: 'scale(1)', offset: 0.7 }, { opacity: 0, transform: 'scale(.96)' }], { duration: ms });
  }
  flash(color, ms) {
    if (this.calm) return;
    this.el.flash.style.background = color;
    this.el.flash.animate([{ opacity: 0.5 }, { opacity: 0 }], { duration: ms, easing: 'ease-out' });
  }
  shake(px, ms) {
    if (this.calm) return;
    this.el.stage.animate([{ transform: `translate(${px}px,${px / 2}px)` }, { transform: `translate(${-px}px,0)` },
      { transform: `translate(${px / 2}px,${-px}px)` }, { transform: 'translate(0,0)' }], { duration: ms });
  }

  onSpawn(e) {
    const c = this.el.core;
    c.dataset.type = e.isBoss ? 'boss' : e.id; c.dataset.status = '';
    c.style.setProperty('--ec', e.def.visual.color); c.style.setProperty('--sz', e.def.visual.scale);
    c.style.transition = 'none'; c.classList.remove('dead'); void c.offsetWidth; c.style.transition = '';
    if (!this.calm) c.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 300, easing: 'ease-out' });
    this.cache = {};
    if (e.isBoss) { this.banner(e.name, 1200, true); this.audio.phase(); }
  }
  onBreakStart() {
    this.root.classList.add('break-mode');
    this.banner('BREAK', 750); this.flash('#ffffff', 180); this.shake(10, 260); this.audio.breakStart();
    const m = this.fb.center(); this.fb.burst(m.x, m.y, 45, 7);
    if (!this.calm) this.el.core.animate([{ transform: 'scale(1.22)' }, { transform: 'scale(1)' }], { duration: 220, easing: 'ease-out' });
  }
  onDefeat(e) {
    const m = this.fb.center();
    this.fb.burst(m.x, m.y, e.isBoss ? CONFIG.maxParticles : 50, e.isBoss ? 9 : 6);
    this.el.core.classList.add('dead');
    this.audio.defeat(e.isBoss);
    if (e.isBoss) { this.flash('#ffffff', 400); this.shake(16, 420); this.banner('DERROTADO', 1200); }
  }

  set(key, el, text) { if (this.cache[key] !== text) { this.cache[key] = text; el.textContent = text; } }

  // Chamado a cada frame; só escreve no DOM quando algo muda.
  render() {
    const e = this.combat.enemy, c = this.el.core;
    if (!e) return;
    const st = e.status || '';
    if (this.cache.status !== st) { this.cache.status = st; c.dataset.status = st; }
    const breaking = e.state === S.BREAKING;
    const ratio = breaking ? e.breakTimer / K.breakDuration : e.breakCurrent / e.breakMax;
    const q = Math.round(ratio * 500) / 500;
    if (this.cache.br !== q) { this.cache.br = q; this.el.brk.style.transform = `scaleX(${q})`; }
    this.set('name', this.el.name, e.isBoss ? `${e.name} · FASE ${e.phase}` : e.name);
    this.set('brk', this.el.brkLabel, breaking ? 'BREAK!' : `BREAK ${fmt(Math.ceil(e.breakCurrent))} / ${fmt(e.breakMax)}`);
    const r = this.state.run, rm = e.rewardMult();
    this.set('info', this.el.info, `ESTÁGIO ${r.stage} · TIER ${r.difficultyTier + 1}` + (rm > 1.01 ? ` · RECOMPENSA ×${rm.toFixed(1)}` : ''));
  }
}
