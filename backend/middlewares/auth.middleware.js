const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "48d874b79df7a52764ab06d2bd5a41ef";
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Access token required",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: false,
        message: "Invalid or expired token",
      });
    }

    req.user = user;
    next();
  });
};
