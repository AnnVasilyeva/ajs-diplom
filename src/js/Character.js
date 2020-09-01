export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
    // TODO: throw error if user use "new Character()"
    if (new.target.name === 'Character') {
      throw new Error('you cannot create objects through new Character')
    };
  }

  levelUp() {
      if (this.health <= 0) {
        throw new Error('нельзя повысить уровень умершего');
      } else {
        this.level += 1;
        this.health = (this.health + 80) < 100 ? this.health + 80 : 100;
        this.attack = this.getAttack(this.attack, this.health);
        this.defence = this.getAttack(this.defence, this.health);

      }
    }

  getAttack (attackBefore, life) {
    return Math.max(attackBefore, attackBefore * (180 - life) / 100);
  }

}
