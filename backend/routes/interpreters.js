const express = require('express');
const router = express.Router();
const { getAllInterpreters, getInterpreterById, exportInterpreterCalls } = require('../controllers/interpreterController');

router.get('/', getAllInterpreters);
router.get('/:id', getInterpreterById);
router.get('/:id/export', exportInterpreterCalls);

module.exports = router;
