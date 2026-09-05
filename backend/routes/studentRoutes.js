const express = require('express');
const router = express.Router();
const {
  getStudentsByDataset,
  getStudentDriveHistory,
} = require('../controllers/studentController');

router.get('/dataset/:id', getStudentsByDataset);
router.get('/:id/drives', getStudentDriveHistory);

module.exports = router;
