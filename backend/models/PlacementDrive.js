const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    ctcLpa: {
      type: Number,
      required: true,
    },
    driveDate: {
      type: String,
      required: true,
    },
    driveLink: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentDataset',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Saved', 'Draft', 'Archived'],
      default: 'Saved',
    },
    filterSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    eligibleCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
