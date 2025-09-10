import { Nomalizer } from '#shared/utils/index.js'

// Function map strategy thay cho switch case
const NormalizeStrategy = {
  status: (k, q, f, v) => Nomalizer.enum(k, v, f),
  method: (k, q, f, v) => Nomalizer.enum(k, v, f),
  description: (k, q, f, v) => Nomalizer.text(k, v, f),

  created_at_from: (k, q, f, v) => Nomalizer.dateRange(q, f, "created_at"),
  created_at_to: (k, q, f, v) => Nomalizer.dateRange(q, f, "created_at"),

  due_date_from: (k, q, f, v) => Nomalizer.dateRange(q, f, "due_date"),
  due_date_to: (k, q, f, v) => Nomalizer.dateRange(q, f, "due_date"),

  required_amount_min: (k, q, f, v) => Nomalizer.numberRange(q, f, "required_amount"),
  required_amount_max: (k, q, f, v) => Nomalizer.numberRange(q, f, "required_amount"),

  amount_min: (k, q, f, v) => Nomalizer.numberRange(q, f, "amount"),
  amount_max: (k, q, f, v) => Nomalizer.numberRange(q, f, "amount"),

  paid_at_from: (k, q, f, v) => Nomalizer.numberRange(q, f, "paid_at"),
  paid_at_to: (k, q, f, v) => Nomalizer.numberRange(q, f, "paid_at"),
};

export const normalizeFilter = (query) => {
  const filter = {};

  // Duyệt qua từng phần tử trong query
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (NormalizeStrategy[key]) {
      NormalizeStrategy[key](key, query, filter, value);
    }
    else {
      filter[key] = value;
    }
  });

  return filter;
};