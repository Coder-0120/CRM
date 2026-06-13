const Customer = require('../models/Customer');

function buildMongoQuery(rules, logicOperator) {
  const conditions = rules.map(rule => {
    const { field, operator, value } = rule;
    const numValue = Number(value);

    if (operator === 'gt')  return { [field]: { $gt: numValue } };
    if (operator === 'lt')  return { [field]: { $lt: numValue } };
    if (operator === 'gte') return { [field]: { $gte: numValue } };
    if (operator === 'lte') return { [field]: { $lte: numValue } };
    if (operator === 'eq')  return { [field]: isNaN(numValue) ? value : numValue };
    if (operator === 'contains') return { [field]: { $regex: value, $options: 'i' } };
    if (operator === 'in')  return { [field]: { $in: Array.isArray(value) ? value : [value] } };
    if (operator === 'in_last_days') {
      return { [field]: { $gte: new Date(Date.now() - Number(value) * 86400000) } };
    }
    if (operator === 'not_in_last_days') {
      return { [field]: { $lt: new Date(Date.now() - Number(value) * 86400000) } };
    }
    return {};
  });

  if (logicOperator === 'OR') return { $or: conditions };
  return { $and: conditions };
}

// userId is required so segments only match the owner's customers
async function getAudienceForSegment(segment, userId) {
  const ruleQuery = buildMongoQuery(segment.rules, segment.logicOperator);
  return Customer.find({ userId, ...ruleQuery });
}

async function previewSegment(rules, logicOperator, userId) {
  const ruleQuery = buildMongoQuery(rules, logicOperator);
  const query = userId ? { userId, ...ruleQuery } : ruleQuery;
  const count  = await Customer.countDocuments(query);
  const sample = await Customer.find(query).limit(5)
    .select('name email city totalSpend lastActiveDate');
  return { count, sample };
}

module.exports = { getAudienceForSegment, previewSegment, buildMongoQuery };