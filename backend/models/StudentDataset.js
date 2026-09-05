const mongoose = require('mongoose');

const studentDatasetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Archived'],
      default: 'Active',
    },
    uploadedBy: {
      type: String,
      default: 'T&P Admin',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentDataset', studentDatasetSchema);
