const Student = require('../models/Student');
const EligibilityRecord = require('../models/EligibilityRecord');
const PlacementDrive = require('../models/PlacementDrive');

// GET /api/datasets/:id/students (List & Filter Students)
const getStudentsByDataset = async (req, res, next) => {
  try {
    const { id: datasetId } = req.params;
    const { search, branch, minCgpa, maxBacklogs, page = 1, limit = 100 } = req.query;

    const query = { datasetId };

    if (branch && branch !== 'ALL') {
      query.branch = branch.toUpperCase();
    }

    if (minCgpa) {
      query.cgpa = { $gte: Number(minCgpa) };
    }

    if (maxBacklogs !== undefined) {
      query.backlogs = { $lte: Number(maxBacklogs) };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
        { branch: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [students, total] = await Promise.all([
      Student.find(query).sort({ rollNo: 1 }).skip(skip).limit(Number(limit)),
      Student.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      students,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/students/:id/drives (Get Student Drive History)
const getStudentDriveHistory = async (req, res, next) => {
  try {
    const { id: studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    const records = await EligibilityRecord.find({ studentId }).populate('driveId');

    const history = records
      .filter((r) => r.driveId !== null)
      .map((r) => ({
        drive: r.driveId,
        eligibilityRecord: {
          id: r._id,
          calculatedAt: r.calculatedAt,
        },
      }));

    res.status(200).json({
      success: true,
      student,
      totalEligibleDrives: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentsByDataset,
  getStudentDriveHistory,
};
