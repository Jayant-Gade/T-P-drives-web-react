const PlacementDrive = require('../models/PlacementDrive');
const { createDriveAndPersistSnapshot } = require('../services/eligibilityService');

// POST /api/drives (Create Drive & Persist Snapshot)
const createDrive = async (req, res, next) => {
  try {
    const { companyName, role, ctcLpa, driveDate, driveLink, description, datasetId, filterSnapshot } = req.body;

    if (!companyName || !role || !ctcLpa || !driveDate || !datasetId || !filterSnapshot) {
      res.status(400);
      throw new Error('Company name, role, CTC, drive date, datasetId, and filterSnapshot AST are required.');
    }

    const result = await createDriveAndPersistSnapshot({
      companyName,
      role,
      ctcLpa: Number(ctcLpa),
      driveDate,
      driveLink: driveLink || '',
      description: description || '',
      datasetId,
      filterSnapshot,
    });

    res.status(201).json({
      success: true,
      message: `Placement drive for "${companyName}" created successfully with ${result.eligibleCount} eligible candidates snapshotted.`,
      drive: result.drive,
      eligibleCount: result.eligibleCount,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/datasets/:id/drives (List Drives for Dataset)
const getDrivesByDataset = async (req, res, next) => {
  try {
    const { id: datasetId } = req.params;
    const drives = await PlacementDrive.find({ datasetId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: drives.length,
      drives,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/drives (Get All Drives)
const getAllDrives = async (req, res, next) => {
  try {
    const drives = await PlacementDrive.find().populate('datasetId', 'name academicYear').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: drives.length, drives });
  } catch (error) {
    next(error);
  }
};

// GET /api/drives/:id
const getDriveById = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id).populate('datasetId');
    if (!drive) {
      res.status(404);
      throw new Error('Placement drive not found');
    }
    res.status(200).json({ success: true, drive });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDrive,
  getDrivesByDataset,
  getAllDrives,
  getDriveById,
};
