import Character from '../Character';

test('проверка создания класса через Character', () => {
  expect(() => new Character()).toThrow();
});

// test('проверка создания класса не через Character', () => {
//   const received = new Bowman(1, 'bowman');
//   const expected = {
//     level: 1,
//     health: 80,
//     type: 'bowman',
//     attack: 25,
//     defence: 25,
//     distance: 2,
//     distanceAttack: 1,
//   };
//   expect(received).toEqual(expected);
// });
