import Character from "../Character";

export default class Magicians extends Character {
  constructor(level) {
    super(level);
    this.type = 'magician';
    this.attack = 10;
    this.defence = 40;
    this.level = level;
    this.distance = 1;
    this.distanceAttack = 4;
  }

}
