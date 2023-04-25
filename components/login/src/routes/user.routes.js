const express = require("express");
const { createUser } = require("../controllers/user.controller");
const verifyToken = require("../middlewares/authJwt");
const checkExistingUser = require("../middlewares/verifySignup");

const router = express.Router();

router.post("/", [verifyToken, checkExistingUser], createUser);

module.exports = router;
