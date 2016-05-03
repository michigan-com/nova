'use strict';

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function generateRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

export default function generateCode() {
  let code = generateRandomNumber(1000, 10000);

  return `${code}`;
}
