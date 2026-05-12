module.exports = function (req, res, next) {
    if (req.method === 'OPTIONS') {
      return next();
    }

    const apiKey = req.headers['x-api-key'];
  
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    next();
  };