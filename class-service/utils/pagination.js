export default async function paginate(repository, {
  page = 1,
  limit = 10,
  orderBy,
  where = null,
  include = null
} = {}) {
  const skip = (page - 1) * limit;

  const data = await repository.findMany(where, { skip, take: limit, orderBy, include });

  const totalItems = await repository.count(where);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalPages,
    totalItems,
    data,
  };
}