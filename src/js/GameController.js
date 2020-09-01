import themes from './themes';
import Team from './Team';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import GamePlay from './GamePlay';
import GameState from './GameState';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.themes = themes.prairie; // тема поля
    this.blockedBoard = false;
    this.index = 0;
    this.level = 1;
    this.points = 0; //очки
    this.userTeam = [];
    this.enemyTeam = [];
    this.userPositions = [];
    this.enemyPositions = [];
    this.boardSize = gamePlay.boardSize; // размер поля
    this.selectedCharacterIndex = 0; // индекс клетки выбранного персонажа
    this.selected = false; //персонаж выбран?
    this.selectedCharacter = {}; //выбранный персонаж
    this.currentMove = 'user'; // кто ходит?

  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(this.themes);
    this.nextLevel();
    this.gamePlay.addNewGameListener(this.newGame.bind(this));
    this.gamePlay.addSaveGameListener(this.saveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.loadGame.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  async onCellClick(index) {
    // TODO: react to click
    this.index = index;

    // если поле активно
    if (!this.blockedBoard) {
      if (this.gamePlay.boardEl.style.cursor === 'not-allowed') {
        GamePlay.showError('Не входит в допустимый радиус');
      } else if (this.getIndex([...this.userPositions]) !== -1) {
        // если персонаж соответсвует списку пользовательских
        // снимаем выделение с ранее отмеченного персонажа
        this.gamePlay.deselectCell(this.selectedCharacterIndex);
        // отмечаем кликнутого персонажа желтым кругом
        this.gamePlay.selectCell(index);
        // теперь индекс отмечается как выбранный индекс
        this.selectedCharacterIndex = index;
        // отмечаем выбранный персонаж из списка персонажей по индексу
        this.selectedCharacter = [...this.userPositions].find(item => item.position === index);
        // теперь персонаж выбран
        this.selected = true;
      } else if (!this.selected && this.getIndex([...this.enemyPositions]) !== -1) {
        // если персонаж не выбран и он есть в списке врагов
        GamePlay.showError('нельзя играть за врага');
      } else if (this.selected && this.gamePlay.boardEl.style.cursor === 'pointer') {
        // если персонаж выбран и курсор на клетке pointer
        this.selectedCharacter.position = index;
        this.gamePlay.deselectCell(this.selectedCharacterIndex);
        this.gamePlay.deselectCell(index);
        this.selected = false;

        this.gamePlay.redrawPositions([...this.userPositions, ...this.enemyPositions]);

        this.currentMove = 'enemy';
        this.enemyStrategy();

      } else if (this.selected && this.gamePlay.boardEl.style.cursor === 'crosshair') {
        // если персонаж выбран и курсор на клетке crosshair
        const thisAttackEnemy = [...this.enemyPositions].find((item) => item.position === index);
        this.gamePlay.deselectCell(this.selectedCharacterIndex);
        this.gamePlay.deselectCell(index);
        this.gamePlay.setCursor(cursors.auto);
        this.selected = false;

        await this.characterAttacking(this.selectedCharacter.character, thisAttackEnemy);
        if (this.enemyPositions.length > 0) {

          console.log(thisAttackEnemy);

          this.getEnemyAttack(this.selectedCharacter, thisAttackEnemy);
        }
      }
    }
  }

  getIndex(array) {
    return array.findIndex(item => item.position === this.index);
  }

  async characterAttacking(attaker, target) {
    // считаем нанесенный урон
    let damage = Math.floor(Math.max(attaker.attack - target.character.defence, attaker.attack * 0.1));

    await this.gamePlay.showDamage(target.position, damage);

     const targetedCharacter = target.character;
     // уменьшаем здоровье на полученный урон
    if (targetedCharacter.health - damage > 0) {
      targetedCharacter.health -= damage;
    } else {
      targetedCharacter.health = 0;
    }

     // меняем  игрока
     this.currentMove = this.currentMove === 'enemy' ? 'user' : 'enemy';

     // проверяем здоровье после атаки
     if (targetedCharacter.health <= 0) {
       this.userPositions = this.userPositions.filter(item => item.position !== target.position);
       this.enemyPositions = this.enemyPositions.filter(item => item.position !== target.position);
     }
     // проверяем сколько игроков осталось после атаки
     if (this.userPositions.length === 0) {
       GamePlay.showMessage('Game over!');
       this.blockedBoard = true;
     }
     // если врагов не осталось- считаем очки, повышаем уровень
     if (this.enemyPositions.length === 0) {
       for (let item of this.userPositions) {
         this.points += item.character.health;
         item.character.levelUp();
       }
       this.level += 1;
       // переходим на следующий уровень
       this.nextLevel();
     }
     // перерисовываем поле
     this.gamePlay.redrawPositions([...this.userPositions, ...this.enemyPositions]);
  }



  onCellEnter(index) {
    // TODO: react to mouse enter
    this.index = index;
    const icons = {
      level: '\u{1F396}',
      attack: '\u{2694}',
      defence: '\u{1F6E1}',
      health: '\u{2764}'
    }
    if (!this.blockedBoard) {
      for (const item of [...this.userPositions, ...this.enemyPositions] ) {
        if (item.position === index) {
          let message = `${icons.level}${item.character.level} ${icons.attack}${item.character.attack} ${icons.defence}${item.character.defence} ${icons.health}${item.character.health}`;
          this.gamePlay.showCellTooltip(message, index);
        }
      }
    }

    if (this.selected) {
        const allowedPosition = this.selectedCharacter.position;
        const allowedDistance = this.selectedCharacter.character.distance;
        const allowedDistanceAttack = this.selectedCharacter.character.distanceAttack;

        const allowedAttack = this.allowedPositions(allowedPosition, allowedDistanceAttack);
        const allowedPositions = this.allowedPositions(allowedPosition, allowedDistance, true);

        if (this.getIndex(this.userPositions) !== -1) {
          this.gamePlay.setCursor(cursors.pointer);
        } else if (this.getIndex(this.enemyPositions) !== -1 && allowedAttack.includes(index)) {
          // нужно проверять радиус атаки и что персонаж не враг
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor(cursors.crosshair);
        } else if (this.getIndex([...this.userPositions, this.enemyPositions]) === -1 && allowedPositions.includes(index)) {
          // нужно проверять входит ли в радиус дистанции и никого нет на клетке
          this.gamePlay.selectCell(index, 'green');
          this.gamePlay.setCursor(cursors.pointer);
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    if (this.selectedCharacter.position !== index) {
      this.gamePlay.deselectCell(index);
    }
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  newGame() {
    const maxPoint = this.getMaxPoint();
    const gameState = this.stateService.load();
    if (gameState) {
      gameState.maxPoint = maxPoint;
      this.stateService.save(GameState.from(gameState));
    }
    this.userPositions = [];
    this.enemyPositions = [];
    this.level = 1;
    this.points = 0;
    this.themes = themes.prairie;
    this.nextLevel();
  }

  saveGame() {
    const maxPoint = this.getMaxPoint();
    const currentGameState = {
      point: this.points,
      maxPoint,
      level: this.level,
      currentTheme: this.themes,
      userPositions: this.userPositions,
      enemyPositions: this.enemyPositions,
    };
    this.stateService.save(GameState.from(currentGameState));
  }

  loadGame() {
    try {
      const loadGameState = this.stateService.load();
      if (loadGameState) {
        this.point = loadGameState.point;
        this.level = loadGameState.level;
        this.currentTheme = loadGameState.currentTheme;
        this.userPositions = loadGameState.userPositions;
        this.enemyPositions = loadGameState.enemyPositions;
        this.gamePlay.drawUi(this.currentTheme);
        this.gamePlay.redrawPositions([...this.userPositions, ...this.enemyPositions]);
      }
    } catch (e) {
      console.log(e);
      GamePlay.showMessage('Failed!');
      this.newGame();
    }
  }

  // переход по уровням, генерация команд персонажей и тем фона
  nextLevel() {
    if (this.level === 1) {
      this.userTeam = Team.getStartUserTeam();
      this.enemyTeam = generateTeam(Team.getEnemyTeam(), 1, 2);
      this.addPositionedCharacter(this.userTeam, this.enemyTeam);
    } else if (this.level === 2) {
      this.themes = themes.desert;
      this.userTeam.forEach(item => {
        item.levelUp();
      });
      this.userTeam = generateTeam(Team.getUserTeam(), 1, 1);
      this.enemyTeam = generateTeam(Team.getEnemyTeam(), 2, this.userTeam.length);
      this.addPositionedCharacter(this.userTeam, this.enemyTeam);
    } else if (this.level === 3) {
      this.themes = themes.arctic;
      this.userTeam.forEach(item => {
        item.levelUp();
      });
      this.userTeam = generateTeam(Team.getUserTeam(), 2, 2);
      this.enemyTeam = generateTeam(Team.getEnemyTeam(), 3, this.userTeam.length);
      this.addPositionedCharacter(this.userTeam, this.enemyTeam);
    } else if (this.level === 4) {
      this.themes = themes.mountain;
      this.userTeam.forEach(item => {
        item.levelUp();
      });
      this.userTeam = generateTeam(Team.getUserTeam(), 3, 2);
      this.enemyTeam = generateTeam(Team.getEnemyTeam(), 4, this.userTeam.length);
      this.addPositionedCharacter(this.userTeam, this.enemyTeam);
    } else {
      this.blockedBoard = true;
     GamePlay.showMessage(`У вас ${this.points} очков`); //надо выводить количество очков
      return;
    }

   // задаем списки возможных стартовых позиций
    const startUser = this.startUserPositions();
    const startEnemy = this.startEnemyPositions();

    // добавляем стартовые позиции игрокам
    for (let i = 0; i < this.userPositions.length; i++) {
      this.userPositions[i].position = this.getRandom(startUser);
      this.enemyPositions[i].position = this.getRandom(startEnemy);
    }

    this.gamePlay.drawUi(this.themes);
    this.gamePlay.redrawPositions([...this.userPositions, ...this.enemyPositions]);

  }

  // создаем команды персонажей
  addPositionedCharacter(userTeam, enemyTeam) {
    userTeam.forEach(item => {
      this.userPositions.push(new PositionedCharacter(item, 0));
    });
    enemyTeam.forEach(item => {
      this.enemyPositions.push(new PositionedCharacter(item, 0));
    });

  }

  // возможные стартовые позиции игрока
  startUserPositions() {
    let positions = [];
    for (let i = 0; i < this.boardSize ** 2; i++) {
      if (i % this.boardSize === 0 || i % this.boardSize === 1) {
        positions.push(i);
      }
    }
    return positions;
  };

  // возможные стартовые позиции врага
  startEnemyPositions() {
    let positions = [];
    for (let i = 0; i < this.boardSize ** 2; i++) {
      if (i % this.boardSize === this.boardSize - 1 || i % this.boardSize === this.boardSize - 2) {
        positions.push(i);
      }
    }
    return positions;
  };

  // выбираем рандомно позицию из списка возможных
  getRandom(positions) {
    let num = Math.floor(Math.random() * positions.length);
    let random = positions.splice(num, 1);
    return random[0];
  };


// считаем максимальное количество очков
  getMaxPoint() {
    let maxPoint = 0;
    try {
      const gameStateLoad = this.stateService.load();
      if (gameStateLoad) {
        maxPoint = Math.max(gameStateLoad.maxPoint, this.points);
      }
    } catch(e) {
      maxPoint = this.points;
      console.log(e);
    }
  return maxPoint;

  }

  // вернет массив с допустимыми вариантами передвижения или атаки
  allowedPositions(position, distance, isEnemy = false) {

    const allowedPositionsArray = [];
    // номер строки на поле от 0 до 7
    const itemRow = Math.floor(position / this.boardSize);
    // номер колонки на поле от 0 до 7
    const itemColumn = position % this.boardSize;

    for (let i = 1; i <= distance; i++) {
      if ((itemColumn + i) < 8) {
        allowedPositionsArray.push((itemRow * 8) + (itemColumn + i));
      }
      if ((itemColumn - i) >= 0) {
        allowedPositionsArray.push((itemRow * 8) + (itemColumn - i));
      }
      if ((itemRow + i) < 8) {
        allowedPositionsArray.push(((itemRow + i) * 8) + itemColumn);
      }
      if ((itemRow - i) >= 0) {
        allowedPositionsArray.push(((itemRow - i) * 8) + itemColumn);
      }
      if ((itemRow + i) < 8 && (itemColumn + i) < 8) {
        allowedPositionsArray.push(((itemRow + i) * 8) + (itemColumn + i));
      }
      if ((itemRow - i) >= 0 && (itemColumn - i) >= 0) {
        allowedPositionsArray.push(((itemRow - i) * 8) + (itemColumn - i));
      }
      if ((itemRow + i) < 8 && (itemColumn - i) >= 0) {
        allowedPositionsArray.push(((itemRow + i) * 8) + (itemColumn - i));
      }
      if ((itemRow - i) >= 0 && (itemColumn + i) < 8) {
        allowedPositionsArray.push(((itemRow - i) * 8) + (itemColumn + i));
      }
    }

    if (isEnemy === true) {
      // если ходит враг
      // позиция не должна совпадать с позицией персонажа
      let selectedPositions = [];

      for (let i = 0; i < this.userPositions.length; i++) {
        selectedPositions.push(this.userPositions[i].position);
        selectedPositions.push(this.enemyPositions[i].position);
      }

      return allowedPositionsArray.filter(i => selectedPositions.indexOf(i) === -1);
    }

    return allowedPositionsArray;
  }

  // действия врага

  enemyStrategy() {

    if (this.currentMove === 'enemy') {
      // выбираем рандомно врага из списка
      let randomEnemy;

      if (this.enemyPositions.length > 1) {
        randomEnemy = this.getRandom([...this.enemyPositions]);
      } else {
        randomEnemy = this.enemyPositions[0];
      }

      // выбираем рандомно новую позицию из списка возможных
      const allowEnemyPosition = this.getRandom(this.allowedPositions(randomEnemy.position, randomEnemy.character.distance, true));

      // создаем массив с возможными позициями для атаки
      const allowedEnemyDistanceAttack = this.allowedPositions(randomEnemy.position, randomEnemy.character.distanceAttack, true);

      // если персонаж игрока находится в области из возможных позиций атаки
      for (let itemUser of [...this.userPositions]) {

        if (allowedEnemyDistanceAttack.includes(itemUser.position)) {
          // мы делаем атаку на персонажа
          this.characterAttacking(randomEnemy.character, itemUser);
        } else {
          // если нет-переставляем врага на новую рандомную позицию
          randomEnemy.position = allowEnemyPosition;

          this.gamePlay.redrawPositions([...this.userPositions, ...this.enemyPositions]);
          this.currentMove = 'user';
        }
      }
    }
  }

 getEnemyAttack(user, enemy) {
   if (this.currentMove === 'enemy') {

     //после атаки персонажа создаем массив возможных аттак врага на которого напали
     const allowedEnemyDistanceAttack = this.allowedPositions(enemy.position, enemy.character.distanceAttack);
    // если позиция персонажа из списка позиций атаки врага, мы атакуем персонаж ответно
     if(allowedEnemyDistanceAttack.includes(user.position) && enemy.character.health > 0) {
       this.characterAttacking(enemy.character, user);
       if (this.userPositions.length === 0) {
         this.blockedBoard = true;
         GamePlay.showMessage('Вы проиграли!');
         return;
       }
     } else {
       // если мы не можем атаковать тот персонаж который атаковал нас
       // враг переходит на другую рандомную позицию

       const allowEnemyPosition = this.getRandom(this.allowedPositions(enemy.position, enemy.character.distance));
       enemy.position = allowEnemyPosition;


       this.gamePlay.redrawPositions([...this.userPositions, ...this.enemyPositions]);
       this.currentMove = 'user';


     }
   }
  }




}


