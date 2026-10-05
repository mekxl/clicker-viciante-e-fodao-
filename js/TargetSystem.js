export class TargetSystem {
  constructor(state) {
    this.state = state;
    this.onDeath = null; // callback definido pelo RunManager
  }
  reset() {
    const r = this.state.run;
    r.currentHP = r.maxHP;
  }
  isDead() { return this.state.run.currentHP <= 0; }
  takeDamage(amount) {
    const r = this.state.run;
    if (this.isDead()) return false;
    r.currentHP = Math.max(0, r.currentHP - amount);
    if (r.currentHP === 0) this.die();
    return true;
  }
  die() {
    if (this.onDeath) this.onDeath(); // única origem da lógica de morte
  }
}
