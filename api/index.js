// MUST be the very first line — sets Node.js timezone before any Date objects are created
process.env.TZ = 'Asia/Karachi';

const app = require('../backend/app');

module.exports = app;
