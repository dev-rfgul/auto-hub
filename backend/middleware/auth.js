export function requireAuth(req, res, next) {
  try {
    // If a previous auth middleware has already set req.user, pass through
    if (req.user) return next();

    // Try to read httpOnly cookie set by login
    const raw = req.cookies?.user;
    if (raw) {
      let parsed = raw;
      if (typeof raw === 'string') {
        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          // leave as string
        }
      }
      req.user = parsed;
      return next();
    }

    return res.status(401).json({ message: 'Not authenticated' });
  } catch (err) {
    console.error('requireAuth error', err);
    return res.status(500).json({ message: 'Auth middleware error' });
  }
}

export default requireAuth;
