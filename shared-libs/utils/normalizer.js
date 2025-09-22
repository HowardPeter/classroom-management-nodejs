// Chuẩn hóa các field nhiều giá trị
export default class Nomalizer {
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
    if (Array.isArray(value)) {
      filter.OR = value.map(v => ({
        [key]: { contains: v, mode: "insensitive" }
      }));
    } else {
      filter[key] = { contains: value, mode: "insensitive" };
    }
    return filter;
  }
}