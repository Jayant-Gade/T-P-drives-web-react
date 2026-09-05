const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    branch: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    tenthPercentage: {
      type: Number,
      default: 0,
    },
    twelfthPercentage: {
      type: Number,
      default: 0,
    },
    backlogs: {
      type: Number,
      default: 0,
      min: 0,
    },
    graduationYear: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentDataset',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for dataset isolation & fast search
studentSchema.index({ datasetId: 1, rollNo: 1 }, { unique: true });
studentSchema.index({ datasetId: 1, cgpa: 1, branch: 1, backlogs: 1 });

module.exports = mongoose.model('Student', studentSchema);
