const express = require('express');
const { signinHandler, signupHandler } = require('../controllers/auth.controller');
const checkExistingUser = require('../middlewares/verifySignup');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const router = express.Router();

  router.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.post('/signup', upload.single('p12File'), checkExistingUser, signupHandler);
  router.post('/signin', signinHandler);


module.exports = router;
