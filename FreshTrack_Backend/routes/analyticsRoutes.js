const express = require('express');
const router = express.Router();
const {
  getWasteRiskAnalysis,
  getWasteStatistics,
  getInventoryHealth
} = require('../controllers/analyticsController');

router.get('/waste-risk', getWasteRiskAnalysis);

router.get('/waste-stats', getWasteStatistics);

router.get('/inventory-health', getInventoryHealth);

module.exports = router;
