const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: 'Unauthorized. User role identity missing.' });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'Admin') {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden. Role '${req.user.role}' lacks permission for this action.` 
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
