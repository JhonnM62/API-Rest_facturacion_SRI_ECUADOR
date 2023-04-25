const User = require("../models/User.js");

const createUser = async (req, res) => {
  try {
    const { username, email, pfirma_digital } = req.body;
    const p12File = req.file && req.file.buffer;

    // creating a new User
    const user = new User({
      username,
      email,
      pfirma_digital,
      serial,
      p12File,
    });

    // encrypting password
    //user.password = await User.encryptPassword(user.password);

    // saving the new user
    const savedUser = await user.save();

    return res.status(200).json({
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
    });
  } catch (error) {
    console.error(error);
  }
};

const getUsers = async (req, res) => {
  const users = await User.find();
  return res.json(users);
};

const getUser = async (req, res) => {
  const user = await User.findById(req.params.userId);
  return res.json(user);
};

module.exports = {
  createUser,
  getUsers,
  getUser,
};
