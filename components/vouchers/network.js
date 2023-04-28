const express = require("express");
const controller = require("./controller");
const verifyToken = require("../login/src/middlewares/authJwt");

// Logic
const router = express.Router();

router.post("/invoice", verifyToken, async (req, res) => {
  res.type("application/xml");
  res.send(await controller.responseInvoice(req.body, req, res));
});

router.post("/withholdings", async (req, res) => {
  res.type("application/xml");
  res.send(await controller.resposeWithholdings(req.body, req, res));
});

router.post("/guides", async (req, res) => {
  res.type("application/xml");
  res.send(await controller.resposeGuides(req.body, req, res));
});

module.exports = router;
