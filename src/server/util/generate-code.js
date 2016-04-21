'use strict';

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function generateRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

export default function generateCode() {
  let firstNumber = generateRandomNumber(100, 1000);
  let secondNumber = generateRandomNumber(100, 1000);

  return `${firstNumber}${secondNumber}`;
}
