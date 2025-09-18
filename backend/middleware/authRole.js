export function requireRole(allowed = []) {
  return (req, res, next) => {
    try {
      const role = req.user?.role;
      if (!role) return res.status(401).json({ message: 'Not authenticated' });
      if (!allowed.includes(role)) return res.status(403).json({ message: 'Forbidden' });
      return next();
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  };
}

export default requireRole;
