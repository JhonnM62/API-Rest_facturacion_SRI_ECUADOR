const jwt = require("jsonwebtoken");
const { SECRET } = require("../config.js");
const User = require("../models/User.js");

const verifyToken = async (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) return res.status(403).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;

    const user = await User.findById(req.userId, { password: 0 });
    if (!user) return res.status(404).json({ message: "No user found" });

    req.userId = user._id.toString();
    req.pfirma_digital = user.pfirma_digital;
    req.serial = user.serial;
    req.p12File = user.p12File;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized!" });
  }
};

module.exports = verifyToken;
