export function calcTileType(index, boardSize) {
  // TODO: write logic here
  if (index === 0) {
    return 'top-left';
  }
  // index = 7 клетке
  if (index === boardSize - 1) {
    return 'top-right';
  }
  // index от 0 до 7 клетки
  if (index > 0 && index <= boardSize - 1) {
    return 'top';
  }
  // index = 63
  if (index === boardSize ** 2 - 1) {
    return 'bottom-right';
  }
  // index 56
  if (index === boardSize * (boardSize - 1)) {
    return 'bottom-left';
  }
  // index от 56 до 63 клетки
  if (index >= boardSize * (boardSize - 1) && index < boardSize ** 2) {
    return 'bottom';
  }
  // index деленый на 8 в остатке должен быть = 7
  if (index % boardSize === boardSize - 1) {
    return 'right';
  }
  // index деленый на 8 в остатке должен быть = 0
  if (index % boardSize === 0) {
    return 'left';
  }

  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
