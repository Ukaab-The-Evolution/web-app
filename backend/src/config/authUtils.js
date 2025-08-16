import jwt from 'jsonwebtoken';

export const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

export const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.user_id);
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: {
        user_id: user.user_id,
        email: user.email,
        user_type: user.user_type
      }
    }
  });
};
