// Modulos
const express = require("express");
const vouchers = require("../components/vouchers/network");
const usersRoutes = require("../components/login/src/routes/user.routes");
const authRoutes = require("../components/login/src/routes/auth.routes");

//Logic
const routes = (server) => {
  // server.use('/xmlGenereteBill',verifyToken, bill)
  server.use("/generateVouchers", vouchers);
  // Routes login
  server.use("/api/users", usersRoutes);
  server.use("/api/auth", authRoutes);
};

module.exports = routes;
