import validator from 'validator';

export const buildProfileUpdate = (input = {}) => {
  const update = {};
  if (input.full_name !== undefined) {
    const fullName = String(input.full_name).trim();
    if (fullName.length < 2) throw new Error('full_name must contain at least two characters');
    update.full_name = fullName;
  }

  if (input.email !== undefined) {
    const email = String(input.email).trim().toLowerCase();
    if (!validator.isEmail(email)) throw new Error('email must be valid');
    update.email = email;
  }

  if (input.phone !== undefined) {
    const phone = String(input.phone).replace(/[\s()\-]/g, '');
    if (!/^\+?\d{10,15}$/.test(phone)) throw new Error('phone must contain 10-15 digits');
    update.phone = phone;
  }

  return update;
};
