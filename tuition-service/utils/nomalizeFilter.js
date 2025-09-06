// Chuẩn hóa các field nhiều giá trị
class Nomalizer {
  // Chuẩn hóa lọc query field Enum (chuyển thành ký tự hoa)
  static enum(key, value, filter) {
    if (Array.isArray(value)) {
      filter[key] = { in: value.map(v => v.toUpperCase()) };
    } else {
      filter[key] = value.toUpperCase();
    }
    return filter;
  }

  // Chuẩn hóa lọc query date range (from - to)
  static dateRange(query, filter, field) {
    filter[field] = filter[field] || {};
    if (query[`${field}_from`]) filter[field].gte = new Date(query[`${field}_from`]);
    if (query[`${field}_to`]) filter[field].lte = new Date(query[`${field}_to`]);
    return filter;
  }

  // Chuẩn hóa lọc query number range (min - max)
  static numberRange(query, filter, field) {
    filter[field] = filter[field] || {};
    if (query[`${field}_min`]) filter[field].gte = Number(query[`${field}_min`]);
    if (query[`${field}_max`]) filter[field].lte = Number(query[`${field}_max`]);
    return filter;
  }

  // Chuẩn hóa lọc query field text
  static text(key, value, filter) {
    filter[key] = { contains: value, mode: "insensitive" };
    return filter;
  }
}

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