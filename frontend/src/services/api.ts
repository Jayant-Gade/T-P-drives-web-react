import type { Student, StudentDataset, PlacementDrive, EligibilityRecord, FilterAST } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiFetchDatasets(): Promise<StudentDataset[]> {
  const res = await fetch(`${API_BASE_URL}/datasets`);
  if (!res.ok) throw new Error('Failed to fetch datasets');
  const data = await res.json();
  return data.datasets.map((d: any) => ({
    id: d._id || d.id,
    name: d.name,
    academicYear: d.academicYear,
    totalStudents: d.totalStudents,
    status: d.status,
    createdAt: d.createdAt,
    uploadedBy: d.uploadedBy,
  }));
}

export async function apiUploadCSVPreview(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/datasets/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Failed to parse CSV on backend');
  return await res.json();
}

export async function apiConfirmDatasetImport(
  name: string,
  academicYear: string,
  students: Omit<Student, 'id' | 'datasetId'>[]
): Promise<StudentDataset> {
  const res = await fetch(`${API_BASE_URL}/datasets/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, academicYear, students }),
  });

  if (!res.ok) throw new Error('Failed to confirm dataset import');
  const data = await res.json();
  const d = data.dataset;
  return {
    id: d._id || d.id,
    name: d.name,
    academicYear: d.academicYear,
    totalStudents: d.totalStudents,
    status: d.status,
    createdAt: d.createdAt,
    uploadedBy: d.uploadedBy,
  };
}

export async function apiFetchStudents(datasetId: string): Promise<Student[]> {
  const res = await fetch(`${API_BASE_URL}/students/dataset/${datasetId}`);
  if (!res.ok) throw new Error('Failed to fetch students');
  const data = await res.json();
  return data.students.map((s: any) => ({
    id: s._id || s.id,
    rollNo: s.rollNo,
    name: s.name,
    email: s.email,
    phone: s.phone || '',
    branch: s.branch,
    cgpa: s.cgpa,
    tenthPercentage: s.tenthPercentage,
    twelfthPercentage: s.twelfthPercentage,
    backlogs: s.backlogs,
    graduationYear: s.graduationYear,
    gender: s.gender,
    datasetId: s.datasetId,
  }));
}

export async function apiFetchStudentDriveHistory(studentId: string) {
  const res = await fetch(`${API_BASE_URL}/students/${studentId}/drives`);
  if (!res.ok) throw new Error('Failed to fetch student drive history');
  const data = await res.json();
  return data.history.map((h: any) => ({
    drive: {
      id: h.drive._id || h.drive.id,
      companyName: h.drive.companyName,
      role: h.drive.role,
      ctcLpa: h.drive.ctcLpa,
      driveDate: h.drive.driveDate,
      driveLink: h.drive.driveLink,
      description: h.drive.description,
      datasetId: h.drive.datasetId,
      status: h.drive.status,
      filterSnapshot: h.drive.filterSnapshot,
      eligibleCount: h.drive.eligibleCount,
      createdAt: h.drive.createdAt,
    },
    eligibilityRecord: {
      id: h.eligibilityRecord.id,
      driveId: h.drive._id || h.drive.id,
      studentId: studentId,
      datasetId: h.drive.datasetId,
      calculatedAt: h.eligibilityRecord.calculatedAt,
    },
  }));
}

export async function apiFetchDrives(datasetId?: string): Promise<PlacementDrive[]> {
  const url = datasetId
    ? `${API_BASE_URL}/drives/dataset/${datasetId}`
    : `${API_BASE_URL}/drives`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch placement drives');
  const data = await res.json();
  return data.drives.map((d: any) => ({
    id: d._id || d.id,
    companyName: d.companyName,
    role: d.role,
    ctcLpa: d.ctcLpa,
    driveDate: d.driveDate,
    driveLink: d.driveLink,
    description: d.description,
    datasetId: typeof d.datasetId === 'object' ? d.datasetId._id : d.datasetId,
    status: d.status,
    filterSnapshot: d.filterSnapshot,
    eligibleCount: d.eligibleCount,
    createdAt: d.createdAt,
  }));
}

export async function apiCreateDrive(driveData: Omit<PlacementDrive, 'id' | 'eligibleCount' | 'createdAt' | 'status'>) {
  const res = await fetch(`${API_BASE_URL}/drives`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(driveData),
  });

  if (!res.ok) throw new Error('Failed to create placement drive');
  const data = await res.json();
  const d = data.drive;
  return {
    drive: {
      id: d._id || d.id,
      companyName: d.companyName,
      role: d.role,
      ctcLpa: d.ctcLpa,
      driveDate: d.driveDate,
      driveLink: d.driveLink,
      description: d.description,
      datasetId: d.datasetId,
      status: d.status,
      filterSnapshot: d.filterSnapshot,
      eligibleCount: d.eligibleCount,
      createdAt: d.createdAt,
    },
    eligibleCount: data.eligibleCount,
  };
}

export async function apiPreviewEligibility(datasetId: string, filterSnapshot: FilterAST) {
  const res = await fetch(`${API_BASE_URL}/eligibility/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ datasetId, filterSnapshot }),
  });

  if (!res.ok) throw new Error('Failed to calculate eligibility preview');
  const data = await res.json();
  return data.students.map((s: any) => ({
    id: s._id || s.id,
    rollNo: s.rollNo,
    name: s.name,
    email: s.email,
    phone: s.phone || '',
    branch: s.branch,
    cgpa: s.cgpa,
    tenthPercentage: s.tenthPercentage,
    twelfthPercentage: s.twelfthPercentage,
    backlogs: s.backlogs,
    graduationYear: s.graduationYear,
    gender: s.gender,
    datasetId: s.datasetId,
  }));
}

export async function apiFetchEligibleStudentsForDrive(driveId: string): Promise<Student[]> {
  const res = await fetch(`${API_BASE_URL}/eligibility/drive/${driveId}`);
  if (!res.ok) throw new Error('Failed to fetch eligible students for drive');
  const data = await res.json();
  return data.students.map((s: any) => ({
    id: s._id || s.id,
    rollNo: s.rollNo,
    name: s.name,
    email: s.email,
    phone: s.phone || '',
    branch: s.branch,
    cgpa: s.cgpa,
    tenthPercentage: s.tenthPercentage,
    twelfthPercentage: s.twelfthPercentage,
    backlogs: s.backlogs,
    graduationYear: s.graduationYear,
    gender: s.gender,
    datasetId: s.datasetId,
  }));
}
