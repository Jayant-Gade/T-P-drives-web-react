const fs = require('fs');
const csv = require('csv-parser');

/**
 * Parses CSV buffer or file stream and performs validation & type coercion
 */
function parseAndValidateCSV(filePathOrStream) {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];
    let rowNumber = 1; // Header is row 1

    const stream = typeof filePathOrStream === 'string'
      ? fs.createReadStream(filePathOrStream)
      : filePathOrStream;

    stream
      .pipe(csv())
      .on('data', (row) => {
        rowNumber++;
        
        // Normalize header keys (lowercase, trim)
        const normalizedRow = {};
        for (const key of Object.keys(row)) {
          normalizedRow[key.trim().toLowerCase()] = row[key].trim();
        }

        const rollNo = normalizedRow.rollno || normalizedRow['roll no'] || normalizedRow.student_id;
        const name = normalizedRow.name || normalizedRow.student_name;
        const email = normalizedRow.email || `${rollNo?.toLowerCase()}@college.edu`;
        const phone = normalizedRow.phone || normalizedRow.mobile || '';
        const branch = (normalizedRow.branch || normalizedRow.department || 'CSE').toUpperCase();
        const cgpa = parseFloat(normalizedRow.cgpa);
        const tenth = parseFloat(normalizedRow['10th'] || normalizedRow.tenthpercentage || 0);
        const twelfth = parseFloat(normalizedRow['12th'] || normalizedRow.twelfthpercentage || 0);
        const backlogs = parseInt(normalizedRow.backlogs || normalizedRow.backlog_count || 0, 10);
        const gradYear = parseInt(normalizedRow.graduationyear || normalizedRow.batch || 2026, 10);
        const gender = normalizedRow.gender || 'Male';

        // Validation Checks
        if (!rollNo || !name) {
          errors.push({ row: rowNumber, field: 'rollNo/name', message: 'Missing primary student key (Roll No or Name)' });
          return;
        }

        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
          errors.push({ row: rowNumber, field: 'cgpa', message: `Invalid CGPA value (${normalizedRow.cgpa}). Must be 0 - 10.` });
        }

        results.push({
          rollNo,
          name,
          email,
          phone,
          branch,
          cgpa: isNaN(cgpa) ? 0 : cgpa,
          tenthPercentage: isNaN(tenth) ? 0 : tenth,
          twelfthPercentage: isNaN(twelfth) ? 0 : twelfth,
          backlogs: isNaN(backlogs) ? 0 : backlogs,
          graduationYear: isNaN(gradYear) ? 2026 : gradYear,
          gender: ['Male', 'Female', 'Other'].includes(gender) ? gender : 'Male',
        });
      })
      .on('end', () => {
        resolve({ students: results, errors, totalRows: rowNumber - 1 });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

module.exports = {
  parseAndValidateCSV,
};
