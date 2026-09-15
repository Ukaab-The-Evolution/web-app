export const extractBearerToken = (req) => {
  const header = req?.headers?.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token || null;
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.user_type)) {
    return res.status(403).json({
      status: 'fail',
      message: 'You do not have permission to perform this action',
    });
  }
  return next();
};
