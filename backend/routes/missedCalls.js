const express = require('express');
const router = express.Router();
const { getMissedCalls, getTrueMissedCalls } = require('../controllers/missedCallController');

router.get('/', getMissedCalls);
router.get('/true', getTrueMissedCalls);

module.exports = router;
