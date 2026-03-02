const express = require('express');
const router = express.Router();
const { getAllCompanies, getCompanyById, exportCompanyCalls } = require('../controllers/companyController');

router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);
router.get('/:id/export', exportCompanyCalls);

module.exports = router;
