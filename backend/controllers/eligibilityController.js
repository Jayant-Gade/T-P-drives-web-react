const EligibilityRecord = require('../models/EligibilityRecord');
const Student = require('../models/Student');
const { previewDriveEligibility } = require('../services/eligibilityService');

// POST /api/eligibility/preview (Calculate Live Preview)
const calculateEligibilityPreview = async (req, res, next) => {
  try {
    const { datasetId, filterSnapshot } = req.body;

    if (!datasetId || !filterSnapshot) {
      res.status(400);
      throw new Error('datasetId and filterSnapshot AST are required.');
    }

    const matchingStudents = await previewDriveEligibility(datasetId, filterSnapshot);

    res.status(200).json({
      success: true,
      eligibleCount: matchingStudents.length,
      students: matchingStudents,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/drives/:id/students (Get Snapshotted Eligible Students)
const getEligibleStudentsForDrive = async (req, res, next) => {
  try {
    const { id: driveId } = req.params;

    const records = await EligibilityRecord.find({ driveId }).populate('studentId');

    const eligibleStudents = records
      .filter((r) => r.studentId !== null)
      .map((r) => r.studentId);

    res.status(200).json({
      success: true,
      driveId,
      eligibleCount: eligibleStudents.length,
      students: eligibleStudents,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateEligibilityPreview,
  getEligibleStudentsForDrive,
};
