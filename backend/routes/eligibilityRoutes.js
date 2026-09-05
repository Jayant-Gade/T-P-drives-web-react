const express = require('express');
const router = express.Router();
const {
  calculateEligibilityPreview,
  getEligibleStudentsForDrive,
} = require('../controllers/eligibilityController');

router.post('/preview', calculateEligibilityPreview);
router.get('/drive/:id', getEligibleStudentsForDrive);

module.exports = router;
