import fs from 'fs';
import path from 'path';

const landingSource = fs.readFileSync(path.join(__dirname, 'Landing.js'), 'utf8');

describe('Landing', () => {
  test('offers existing users a direct login path', () => {
    expect(landingSource).toContain('to="/login"');
    expect(landingSource).toContain('Log in');
  });
});
