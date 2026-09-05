const { Readable } = require('stream');
const StudentDataset = require('../models/StudentDataset');
const Student = require('../models/Student');
const PlacementDrive = require('../models/PlacementDrive');
const { parseAndValidateCSV } = require('../services/csvParserService');

// POST /api/datasets/upload (Preview CSV)
const previewDatasetUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a CSV file.');
    }

    const stream = Readable.from(req.file.buffer.toString());
    const { students, errors, totalRows } = await parseAndValidateCSV(stream);

    res.status(200).json({
      success: true,
      totalRows,
      parsedCount: students.length,
      errorsCount: errors.length,
      errors,
      preview: students.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/datasets/confirm (Save Dataset & Students)
const confirmDatasetImport = async (req, res, next) => {
  try {
    const { name, academicYear, students } = req.body;

    if (!name || !academicYear || !Array.isArray(students) || students.length === 0) {
      res.status(400);
      throw new Error('Dataset name, academic year, and student array are required.');
    }

    // 1. Create Dataset metadata
    const dataset = await StudentDataset.create({
      name,
      academicYear,
      totalStudents: students.length,
      status: 'Active',
      uploadedBy: 'T&P Admin',
    });

    // 2. Map datasetId to student records
    const studentRecords = students.map((s) => ({
      ...s,
      datasetId: dataset._id,
    }));

    // 3. Bulk insert students
    await Student.insertMany(studentRecords, { ordered: false });

    res.status(201).json({
      success: true,
      message: `Dataset "${name}" imported successfully with ${students.length} students.`,
      dataset,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/datasets
const getDatasets = async (req, res, next) => {
  try {
    const datasets = await StudentDataset.find().sort({ createdAt: -1 });
    
    // Attach drive counts
    const datasetsWithMetrics = await Promise.all(
      datasets.map(async (ds) => {
        const driveCount = await PlacementDrive.countDocuments({ datasetId: ds._id });
        return {
          ...ds.toObject(),
          driveCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: datasetsWithMetrics.length,
      datasets: datasetsWithMetrics,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/datasets/:id
const getDatasetById = async (req, res, next) => {
  try {
    const dataset = await StudentDataset.findById(req.params.id);
    if (!dataset) {
      res.status(404);
      throw new Error('Dataset not found');
    }
    res.status(200).json({ success: true, dataset });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  previewDatasetUpload,
  confirmDatasetImport,
  getDatasets,
  getDatasetById,
};
