const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const {
  previewDatasetUpload,
  confirmDatasetImport,
  getDatasets,
  getDatasetById,
} = require('../controllers/datasetController');

router.post('/upload', upload.single('file'), previewDatasetUpload);
router.post('/confirm', confirmDatasetImport);
router.get('/', getDatasets);
router.get('/:id', getDatasetById);

module.exports = router;
