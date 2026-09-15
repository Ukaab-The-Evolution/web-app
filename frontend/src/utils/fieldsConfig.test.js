import { validateFieldInput } from './fieldsConfig';

describe('registration field validation', () => {
  test('accepts UUID trucking-company invite codes', () => {
    expect(validateFieldInput('companycode', '550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  test('rejects malformed invite codes', () => {
    expect(validateFieldInput('companycode', '98765')).toBe(false);
  });
});
