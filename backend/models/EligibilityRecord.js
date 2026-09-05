const mongoose = require('mongoose');

const eligibilityRecordSchema = new mongoose.Schema(
  {
    driveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentDataset',
      required: true,
      index: true,
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for fast queries and uniqueness
eligibilityRecordSchema.index({ driveId: 1, studentId: 1 }, { unique: true });
eligibilityRecordSchema.index({ studentId: 1, driveId: 1 });

module.exports = mongoose.model('EligibilityRecord', eligibilityRecordSchema);
