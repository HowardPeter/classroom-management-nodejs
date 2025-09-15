import { Nomalizer } from '#shared/utils/index.js'

// Function map strategy cho Teacher
const NormalizeStrategy = {
  full_name: (k, q, f, v) => Nomalizer.text(k, v, f),
  email: (k, q, f, v) => Nomalizer.text(k, v, f),
  phone: (k, q, f, v) => Nomalizer.text(k, v, f),
  address: (k, q, f, v) => Nomalizer.text(k, v, f),

  enrollment_date_from: (k, q, f, v) => Nomalizer.dateRange(q, f, "enrollment_date"),
  enrollment_date_to: (k, q, f, v) => Nomalizer.dateRange(q, f, "enrollment_date"),

  date_of_birth_from: (k, q, f, v) => Nomalizer.dateRange(q, f, "date_of_birth"),
  date_of_birth_to: (k, q, f, v) => Nomalizer.dateRange(q, f, "date_of_birth"),
};

export default function normalizeFilter (query) {
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