const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const { SECRET } = require("../config.js");

const signupHandler = async (req, res) => {
  try {
    const { username, email, pfirma_digital, serial } = req.body;
    // obtener el archivo .p12 de la petición (si existe)
    const p12File = req.file && req.file.buffer;

    // Creating a new User Object
    const newUser = new User({
      username,
      email,
      pfirma_digital,
      serial,
      p12File,
    });

    // Saving the User Object in Mongodb
    const savedUser = await newUser.save();

    // Create a token
    const token = jwt.sign({ id: savedUser._id }, SECRET, {
      expiresIn: 2592000, // 30 DIAS hours
    });

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const signinHandler = async (req, res) => {
  try {
    // Request body email can be an email or username
    const userFound = await User.findOne({ email: req.body.email }).populate();
    if (!userFound) return res.status(400).json({ message: "User Not Found" });

    const matchPassword = await User.comparePassword(
      req.body.pfirma_digital,
      userFound.pfirma_digital
    );

    if (!matchPassword)
      return res.status(401).json({
        token: null,
        message: "Invalid Password",
      });

    const token = jwt.sign({ id: userFound._id }, SECRET, {
      expiresIn: 2592000, // 30 DIAS
    });

    res.json({ token });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  signupHandler,
  signinHandler,
};
