'use strict';

const validateCurrency = require('./validateCurrency');
const { testInvalidInputTypes, testValidStringInputs, testInvalidStringInputs } = require('./testHelpers');

describe('validateCurrency', () => {
  testValidStringInputs(validateCurrency, ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']);

  testInvalidStringInputs(validateCurrency, ['XYZ', 'BTC', 'INR', 'usd', 'Usd']);

  testInvalidInputTypes(validateCurrency);
});
