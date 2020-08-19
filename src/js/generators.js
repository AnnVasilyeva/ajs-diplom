/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  // формула Math.floor(Math.random() * (max - min + 1)) + min;
  // Максимум и минимум включаются
  const characterLevel = Math.floor((Math.random() * maxLevel) + 1);

  // формула Math.floor(Math.random() * (max - min)) + min;
  // Максимум не включается, минимум включается
  const characterType = Math.floor(Math.random() * allowedTypes.length);

  yield new allowedTypes[characterType](characterLevel);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  // character = [{value: new Bowman(1), done: false}, {...}] - пример

  const team = [];

  for (let i = 0; i < characterCount; i++) {
    const character = characterGenerator(allowedTypes, maxLevel);
    team.push(character.next().value);
  }
  return team;
}
