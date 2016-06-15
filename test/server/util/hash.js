'use strict';

import { equal } from 'assert';

import { hash, passwordMatch } from '../../../dist/util/hash';

describe('Testing util/hash', () => {

  it('testing password matching', () => {
    let testCases = [
      'abc123',
      'qwertyuiop',
      '12345678910',
      'sidvdifsvasfvdv',
    ];

    for (let str in testCases) {
      let hashed = hash(str);
      equal(passwordMatch(str, hashed), true, 'Password ${str} should be hashed as ${hashed}')
    }
  });
});
