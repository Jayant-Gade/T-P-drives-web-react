export interface Student {
  id: string; // Internal unique ID or Roll Number
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  cgpa: number;
  tenthPercentage: number;
  twelfthPercentage: number;
  backlogs: number;
  graduationYear: number;
  gender: 'Male' | 'Female' | 'Other';
  datasetId: string;
}

export interface StudentDataset {
  id: string;
  name: string;
  academicYear: string;
  totalStudents: number;
  status: 'Active' | 'Archived';
  createdAt: string;
  uploadedBy: string;
}

export type FilterOperator = 'gte' | 'lte' | 'eq' | 'in' | 'neq';

export interface FilterRule {
  id: string;
  field: keyof Student | string;
  operator: FilterOperator;
  value: string | number | string[];
}

export interface FilterAST {
  rules: FilterRule[];
  logic: 'AND';
}

export interface PlacementDrive {
  id: string;
  companyName: string;
  role: string;
  ctcLpa: number;
  driveDate: string;
  driveLink?: string;
  description: string;
  datasetId: string;
  status: 'Saved' | 'Draft' | 'Archived';
  filterSnapshot: FilterAST;
  eligibleCount: number;
  createdAt: string;
}

export interface EligibilityRecord {
  id: string;
  driveId: string;
  studentId: string;
  datasetId: string;
  calculatedAt: string;
}

export interface CSVValidationError {
  row: number;
  field: string;
  message: string;
}

export type FontFamilyType = 'Inter' | 'Roboto' | 'Outfit' | 'Fira Code' | 'System';
export type FontSizeOption = 'sm' | 'base' | 'lg' | 'xl';
export type UIScaleOption = 'compact' | 'normal' | 'spacious';

export interface UISettings {
  fontSize: FontSizeOption;
  textScale: number; // 90 to 130 %
  textWrap: boolean;
  uiScale: UIScaleOption;
  fontFamily: FontFamilyType;
  isDemoMode: boolean;
}

// Runtime helper constants to ensure JS module compliance in Vite ESM bundler
export const SYSTEM_ROLES = ['Admin', 'Staff', 'Viewer'] as const;
export const DEFAULT_ACADEMIC_YEAR = '2026-2027';

