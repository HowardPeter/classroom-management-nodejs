import { Nomalizer } from '#shared/utils/index.js'

// Function map strategy cho Teacher
const NormalizeStrategy = {
  full_name: (k, q, f, v) => Nomalizer.text(k, v, f),
  email: (k, q, f, v) => Nomalizer.text(k, v, f),
  phone: (k, q, f, v) => Nomalizer.text(k, v, f),
  expertise: (k, q, f, v) => Nomalizer.text(k, v, f),

  created_at_from: (k, q, f, v) => Nomalizer.dateRange(q, f, "created_at"),
  created_at_to: (k, q, f, v) => Nomalizer.dateRange(q, f, "created_at"),

  updated_at_from: (k, q, f, v) => Nomalizer.dateRange(q, f, "updated_at"),
  updated_at_to: (k, q, f, v) => Nomalizer.dateRange(q, f, "updated_at"),
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