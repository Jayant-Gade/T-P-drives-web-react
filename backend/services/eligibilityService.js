const Student = require('../models/Student');
const PlacementDrive = require('../models/PlacementDrive');
const EligibilityRecord = require('../models/EligibilityRecord');
const { translateASTToMongo } = require('../utils/astTranslator');

/**
 * Calculates matching students for a drive filter AST without persisting
 */
async function previewDriveEligibility(datasetId, filterAST) {
  const query = translateASTToMongo(filterAST, datasetId);
  const matchingStudents = await Student.find(query).sort({ rollNo: 1 });
  return matchingStudents;
}

/**
 * Creates placement drive and bulk inserts EligibilityRecords snapshot
 */
async function createDriveAndPersistSnapshot(driveData) {
  const { datasetId, filterSnapshot } = driveData;

  // 1. Evaluate matching students
  const matchingStudents = await previewDriveEligibility(datasetId, filterSnapshot);

  // 2. Create Placement Drive Document
  const drive = new PlacementDrive({
    ...driveData,
    eligibleCount: matchingStudents.length,
    status: 'Saved',
  });

  await drive.save();

  // 3. Bulk Insert EligibilityRecords Snapshot
  if (matchingStudents.length > 0) {
    const eligibilityDocs = matchingStudents.map((student) => ({
      driveId: drive._id,
      studentId: student._id,
      datasetId: datasetId,
      calculatedAt: new Date(),
    }));

    await EligibilityRecord.insertMany(eligibilityDocs, { ordered: false });
  }

  return {
    drive,
    eligibleCount: matchingStudents.length,
    students: matchingStudents,
  };
}

module.exports = {
  previewDriveEligibility,
  createDriveAndPersistSnapshot,
};
