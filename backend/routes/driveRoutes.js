const express = require('express');
const router = express.Router();
const {
  createDrive,
  getDrivesByDataset,
  getAllDrives,
  getDriveById,
} = require('../controllers/driveController');

router.post('/', createDrive);
router.get('/', getAllDrives);
router.get('/dataset/:id', getDrivesByDataset);
router.get('/:id', getDriveById);

module.exports = router;
