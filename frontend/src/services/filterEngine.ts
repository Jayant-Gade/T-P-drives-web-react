import type { Student, FilterAST, FilterRule } from '../types';


export function evaluateRule(student: Student, rule: FilterRule): boolean {
  const fieldValue = (student as Record<string, any>)[rule.field];
  if (fieldValue === undefined || fieldValue === null) return false;

  switch (rule.operator) {
    case 'gte':
      return Number(fieldValue) >= Number(rule.value);
    case 'lte':
      return Number(fieldValue) <= Number(rule.value);
    case 'eq':
      if (typeof fieldValue === 'number') {
        return Number(fieldValue) === Number(rule.value);
      }
      return String(fieldValue).toLowerCase() === String(rule.value).toLowerCase();
    case 'neq':
      if (typeof fieldValue === 'number') {
        return Number(fieldValue) !== Number(rule.value);
      }
      return String(fieldValue).toLowerCase() !== String(rule.value).toLowerCase();
    case 'in': {
      let allowedValues: string[] = [];
      if (Array.isArray(rule.value)) {
        allowedValues = rule.value.map((v) => String(v).toLowerCase());
      } else if (typeof rule.value === 'string') {
        allowedValues = rule.value.split(',').map((v) => v.trim().toLowerCase());
      }
      return allowedValues.includes(String(fieldValue).toLowerCase());
    }
    default:
      return true;
  }
}

export function evaluateFilterAST(student: Student, ast: FilterAST): boolean {
  if (!ast || !ast.rules || ast.rules.length === 0) {
    return true; // No filters means all eligible
  }

  // Currently supporting AND logic as per MVP spec
  return ast.rules.every((rule) => evaluateRule(student, rule));
}

export function filterStudents(students: Student[], ast: FilterAST): Student[] {
  return students.filter((student) => evaluateFilterAST(student, ast));
}

export function formatFilterDescription(rule: FilterRule): string {
  const fieldNameMap: Record<string, string> = {
    cgpa: 'CGPA',
    branch: 'Branch',
    backlogs: 'Backlogs',
    tenthPercentage: '10th %',
    twelfthPercentage: '12th %',
    graduationYear: 'Graduation Year',
    gender: 'Gender',
  };

  const name = fieldNameMap[rule.field] || rule.field;

  switch (rule.operator) {
    case 'gte':
      return `${name} ≥ ${rule.value}`;
    case 'lte':
      return `${name} ≤ ${rule.value}`;
    case 'eq':
      return `${name} = ${rule.value}`;
    case 'neq':
      return `${name} ≠ ${rule.value}`;
    case 'in':
      return `${name} in [${Array.isArray(rule.value) ? rule.value.join(', ') : rule.value}]`;
    default:
      return `${name} ${rule.operator} ${rule.value}`;
  }
}
