const StudentDataset = require('../models/StudentDataset');
const Student = require('../models/Student');
const PlacementDrive = require('../models/PlacementDrive');
const EligibilityRecord = require('../models/EligibilityRecord');

async function seedDatabase() {
  try {
    const datasetCount = await StudentDataset.countDocuments();
    if (datasetCount > 0) {
      console.log('[Database Seeder]: Database already contains datasets. Skipping seed.');
      return;
    }

    console.log('[Database Seeder]: Seeding initial MongoDB datasets, students, and placement drives...');

    // 1. Create Datasets
    const ds2026 = await StudentDataset.create({
      name: 'Batch 2026 (Final Year B.Tech)',
      academicYear: '2025-2026',
      totalStudents: 12,
      status: 'Active',
      uploadedBy: 'T&P Admin',
    });

    const ds2025 = await StudentDataset.create({
      name: 'Batch 2025 (Placed Graduated Batch)',
      academicYear: '2024-2025',
      totalStudents: 6,
      status: 'Archived',
      uploadedBy: 'T&P Staff',
    });

    // 2. Create Students for Batch 2026
    const students2026Data = [
      { rollNo: '2026CSE001', name: 'Aarav Sharma', email: 'aarav.sharma@college.edu', phone: '+91 9876543210', branch: 'CSE', cgpa: 8.8, tenthPercentage: 92.5, twelfthPercentage: 89.0, backlogs: 0, graduationYear: 2026, gender: 'Male', datasetId: ds2026._id },
      { rollNo: '2026CSE002', name: 'Ananya Verma', email: 'ananya.verma@college.edu', phone: '+91 9876543211', branch: 'CSE', cgpa: 9.1, tenthPercentage: 95.0, twelfthPercentage: 93.5, backlogs: 0, graduationYear: 2026, gender: 'Female', datasetId: ds2026._id },
      { rollNo: '2026IT001', name: 'Rohan Gupta', email: 'rohan.gupta@college.edu', phone: '+91 9876543212', branch: 'IT', cgpa: 7.6, tenthPercentage: 85.0, twelfthPercentage: 82.0, backlogs: 1, graduationYear: 2026, gender: 'Male', datasetId: ds2026._id },
      { rollNo: '2026IT002', name: 'Diya Patel', email: 'diya.patel@college.edu', phone: '+91 9876543213', branch: 'IT', cgpa: 8.2, tenthPercentage: 88.0, twelfthPercentage: 86.5, backlogs: 0, graduationYear: 2026, gender: 'Female', datasetId: ds2026._id },
      { rollNo: '2026ECE001', name: 'Karthik Nair', email: 'karthik.nair@college.edu', phone: '+91 9876543214', branch: 'ECE', cgpa: 7.2, tenthPercentage: 80.0, twelfthPercentage: 78.0, backlogs: 0, graduationYear: 2026, gender: 'Male', datasetId: ds2026._id },
      { rollNo: '2026CSE003', name: 'Ishaan Singh', email: 'ishaan.singh@college.edu', phone: '+91 9876543215', branch: 'CSE', cgpa: 6.9, tenthPercentage: 75.0, twelfthPercentage: 72.0, backlogs: 2, graduationYear: 2026, gender: 'Male', datasetId: ds2026._id },
      { rollNo: '2026ECE002', name: 'Sneha Reddy', email: 'sneha.reddy@college.edu', phone: '+91 9876543216', branch: 'ECE', cgpa: 8.5, tenthPercentage: 90.0, twelfthPercentage: 88.0, backlogs: 0, graduationYear: 2026, gender: 'Female', datasetId: ds2026._id },
      { rollNo: '2026CSE004', name: 'Kabir Mehta', email: 'kabir.mehta@college.edu', phone: '+91 9876543217', branch: 'CSE', cgpa: 7.9, tenthPercentage: 84.0, twelfthPercentage: 81.0, backlogs: 0, graduationYear: 2026, gender: 'Male', datasetId: ds2026._id },
      { rollNo: '2026IT003', name: 'Meera Iyer', email: 'meera.iyer@college.edu', phone: '+91 9876543218', branch: 'IT', cgpa: 8.9, tenthPercentage: 94.0, twelfthPercentage: 91.5, backlogs: 0, graduationYear: 2026, gender: 'Female', datasetId: ds2026._id },
      { rollNo: '2026ME001', name: 'Vikram Joshi', email: 'vikram.joshi@college.edu', phone: '+91 9876543219', branch: 'MECH', cgpa: 7.5, tenthPercentage: 81.0, twelfthPercentage: 79.0, backlogs: 0, graduationYear: 2026, gender: 'Male', datasetId: ds2026._id },
      { rollNo: '2026CSE005', name: 'Tara Deshmukh', email: 'tara.deshmukh@college.edu', phone: '+91 9876543220', branch: 'CSE', cgpa: 9.4, tenthPercentage: 97.0, twelfthPercentage: 96.0, backlogs: 0, graduationYear: 2026, gender: 'Female', datasetId: ds2026._id },
      { rollNo: '2026IT004', name: 'Aditya Kulkarni', email: 'aditya.kulkarni@college.edu', phone: '+91 9876543221', branch: 'IT', cgpa: 7.4, tenthPercentage: 78.0, twelfthPercentage: 76.0, backlogs: 1, graduationYear: 2026, gender: 'Male', datasetId: ds2026._id },
    ];

    const students2026 = await Student.insertMany(students2026Data);

    // 3. Create Students for Batch 2025
    const students2025Data = [
      { rollNo: '2025CSE010', name: 'Priya Saxena', email: 'priya.saxena@college.edu', phone: '+91 9811122233', branch: 'CSE', cgpa: 8.7, tenthPercentage: 91.0, twelfthPercentage: 89.0, backlogs: 0, graduationYear: 2025, gender: 'Female', datasetId: ds2025._id },
      { rollNo: '2025IT015', name: 'Varun Rao', email: 'varun.rao@college.edu', phone: '+91 9811122234', branch: 'IT', cgpa: 8.0, tenthPercentage: 86.0, twelfthPercentage: 83.0, backlogs: 0, graduationYear: 2025, gender: 'Male', datasetId: ds2025._id },
      { rollNo: '2025CSE018', name: 'Neha Roy', email: 'neha.roy@college.edu', phone: '+91 9811122235', branch: 'CSE', cgpa: 9.0, tenthPercentage: 93.0, twelfthPercentage: 91.0, backlogs: 0, graduationYear: 2025, gender: 'Female', datasetId: ds2025._id },
      { rollNo: '2025ECE008', name: 'Siddharth Agarwal', email: 'siddharth.agarwal@college.edu', phone: '+91 9811122236', branch: 'ECE', cgpa: 7.8, tenthPercentage: 82.0, twelfthPercentage: 80.0, backlogs: 0, graduationYear: 2025, gender: 'Male', datasetId: ds2025._id },
      { rollNo: '2025CSE025', name: 'Rahul Bhatt', email: 'rahul.bhatt@college.edu', phone: '+91 9811122237', branch: 'CSE', cgpa: 7.1, tenthPercentage: 76.0, twelfthPercentage: 74.0, backlogs: 2, graduationYear: 2025, gender: 'Male', datasetId: ds2025._id },
      { rollNo: '2025IT030', name: 'Tanvi Kapoor', email: 'tanvi.kapoor@college.edu', phone: '+91 9811122238', branch: 'IT', cgpa: 8.3, tenthPercentage: 88.5, twelfthPercentage: 87.0, backlogs: 0, graduationYear: 2025, gender: 'Female', datasetId: ds2025._id },
    ];

    const students2025 = await Student.insertMany(students2025Data);

    // 4. Create Placement Drives
    const driveGoogle = await PlacementDrive.create({
      companyName: 'Google India',
      role: 'Software Development Engineer',
      ctcLpa: 32,
      driveDate: '2026-03-10',
      driveLink: 'https://careers.google.com',
      description: 'Core engineering hiring for SDE-1 roles in Bangalore and Hyderabad offices.',
      datasetId: ds2026._id,
      status: 'Saved',
      filterSnapshot: {
        logic: 'AND',
        rules: [
          { id: 'r1', field: 'cgpa', operator: 'gte', value: 8.5 },
          { id: 'r2', field: 'backlogs', operator: 'eq', value: 0 },
          { id: 'r3', field: 'branch', operator: 'in', value: ['CSE', 'IT'] },
        ],
      },
      eligibleCount: 5,
    });

    const driveTCS = await PlacementDrive.create({
      companyName: 'TCS Digital',
      role: 'Systems Engineer',
      ctcLpa: 7.5,
      driveDate: '2026-03-25',
      driveLink: 'https://tcs.com/careers',
      description: 'Mass hiring drive for CS, IT, and ECE graduates with minimum 7.5 CGPA.',
      datasetId: ds2026._id,
      status: 'Saved',
      filterSnapshot: {
        logic: 'AND',
        rules: [
          { id: 'r10', field: 'cgpa', operator: 'gte', value: 7.5 },
          { id: 'r11', field: 'backlogs', operator: 'eq', value: 0 },
        ],
      },
      eligibleCount: 8,
    });

    const driveMS = await PlacementDrive.create({
      companyName: 'Microsoft APAC',
      role: 'Cloud Solution Engineer',
      ctcLpa: 28,
      driveDate: '2025-04-12',
      driveLink: 'https://careers.microsoft.com',
      description: 'Historical drive for 2025 batch.',
      datasetId: ds2025._id,
      status: 'Saved',
      filterSnapshot: {
        logic: 'AND',
        rules: [
          { id: 'r20', field: 'cgpa', operator: 'gte', value: 8.0 },
          { id: 'r21', field: 'backlogs', operator: 'eq', value: 0 },
        ],
      },
      eligibleCount: 4,
    });

    // 5. Create Eligibility Records Snapshot
    // Google India eligible: Aarav (001), Ananya (002), Diya (IT002), Meera (IT003), Tara (CSE005)
    const googleEligibleRolls = ['2026CSE001', '2026CSE002', '2026IT002', '2026IT003', '2026CSE005'];
    const googleStudents = students2026.filter((s) => googleEligibleRolls.includes(s.rollNo));

    const googleRecords = googleStudents.map((s) => ({
      driveId: driveGoogle._id,
      studentId: s._id,
      datasetId: ds2026._id,
      calculatedAt: new Date(),
    }));

    // TCS Digital eligible: Aarav, Ananya, Diya, Sneha, Kabir, Meera, Vikram, Tara
    const tcsEligibleRolls = ['2026CSE001', '2026CSE002', '2026IT002', '2026ECE002', '2026CSE004', '2026IT003', '2026ME001', '2026CSE005'];
    const tcsStudents = students2026.filter((s) => tcsEligibleRolls.includes(s.rollNo));

    const tcsRecords = tcsStudents.map((s) => ({
      driveId: driveTCS._id,
      studentId: s._id,
      datasetId: ds2026._id,
      calculatedAt: new Date(),
    }));

    // Microsoft 2025 eligible: Priya, Varun, Neha, Tanvi
    const msEligibleRolls = ['2025CSE010', '2025IT015', '2025CSE018', '2025IT030'];
    const msStudents = students2025.filter((s) => msEligibleRolls.includes(s.rollNo));

    const msRecords = msStudents.map((s) => ({
      driveId: driveMS._id,
      studentId: s._id,
      datasetId: ds2025._id,
      calculatedAt: new Date(),
    }));

    await EligibilityRecord.insertMany([...googleRecords, ...tcsRecords, ...msRecords]);

    console.log('[Database Seeder]: Database successfully populated with initial datasets, students, drives, and eligibility records!');
  } catch (error) {
    console.error('[Database Seeder Error]:', error.message);
  }
}

module.exports = seedDatabase;
