const config = require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  SECRET: process.env.SECRET || 'Autosystem',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@localhost',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin'
};