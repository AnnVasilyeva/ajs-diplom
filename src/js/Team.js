import Bowman from "./characters/Bowman";
import Daemon from "./characters/Daemon";
import Undead from "./characters/Undead";
import Magician from "./characters/Magician";
import Swordsman from "./characters/Swordsman";
import Vampire from "./characters/Vampire";

export default class Team {
  static getStartUserTeam() {
    return [new Bowman(1), new Swordsman(1)];
  }

  static getUserTeam() {
    return [Bowman, Swordsman, Magician];
  }

  static getEnemyTeam() {
    return [Daemon, Undead, Vampire];
  }
}
