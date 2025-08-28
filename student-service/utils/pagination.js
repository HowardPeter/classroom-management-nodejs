export default async function paginate(model, { page = 1, limit = 10, orderBy = { full_name: "asc" }, where = {} }) {
  const skip = (page - 1) * limit;

  const data = await model.findMany(where, { skip, limit, orderBy });

  const totalItems = await model.count(where);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalPages,
    totalItems,
    data,
  };
}
