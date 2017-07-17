'use strict';

import { equal } from 'assert';

import { isValidPhoneNumber } from '../../../dist/util/parse';

describe('Tests util/parse', () => {

  it('Tests phone number parsing', () => {
    let validPhoneNumbers = [
      '3135550123',
      '2492345432',
      '1234567890',
      '0987654321',
    ];

    let invalidPhoneNumbers = [
      'asdasdfasdf',
      '131355501235',
      '123123123123123123123',
      'four score and twenty years ago',
      'this and that and this and that and this and that'
    ];

    for (let number of validPhoneNumbers) {
      equal(isValidPhoneNumber(number), true, `Phone number ${number} is supposed to be valid`)
    }

    for (let number of invalidPhoneNumbers) {
      equal(isValidPhoneNumber(number), false, `Phone number ${number} is supposed to be invalid`)
    }
  });
});
