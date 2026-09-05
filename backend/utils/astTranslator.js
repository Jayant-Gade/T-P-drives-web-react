/**
 * AST Translator Module
 * Translates frontend JSON Filter AST into MongoDB query filter objects.
 * Prevents NoSQL injection by enforcing explicit operator whitelist.
 */

const ALLOWED_FIELDS = [
  'cgpa',
  'branch',
  'backlogs',
  'tenthPercentage',
  'twelfthPercentage',
  'graduationYear',
  'gender',
];

function translateRuleToMongo(rule) {
  const { field, operator, value } = rule;

  if (!ALLOWED_FIELDS.includes(field)) {
    throw new Error(`Unauthorized or invalid filter field: ${field}`);
  }

  switch (operator) {
    case 'gte':
      return { [field]: { $gte: Number(value) } };
    case 'lte':
      return { [field]: { $lte: Number(value) } };
    case 'eq':
      if (typeof value === 'number' || !isNaN(Number(value))) {
        return { [field]: Number(value) };
      }
      return { [field]: { $regex: new RegExp(`^${value}$`, 'i') } };
    case 'neq':
      if (typeof value === 'number' || !isNaN(Number(value))) {
        return { [field]: { $ne: Number(value) } };
      }
      return { [field]: { $ne: String(value) } };
    case 'in': {
      let valuesArray = [];
      if (Array.isArray(value)) {
        valuesArray = value;
      } else if (typeof value === 'string') {
        valuesArray = value.split(',').map((v) => v.trim());
      }
      return { [field]: { $in: valuesArray.map((v) => (isNaN(Number(v)) ? new RegExp(`^${v}$`, 'i') : Number(v))) } };
    }
    default:
      throw new Error(`Unsupported filter operator: ${operator}`);
  }
}

function translateASTToMongo(ast, datasetId) {
  const query = { datasetId };

  if (!ast || !ast.rules || !Array.isArray(ast.rules) || ast.rules.length === 0) {
    return query;
  }

  const conditions = ast.rules.map(translateRuleToMongo);

  if (conditions.length === 1) {
    return { ...query, ...conditions[0] };
  }

  return {
    ...query,
    $and: conditions,
  };
}

module.exports = {
  translateASTToMongo,
  translateRuleToMongo,
};
