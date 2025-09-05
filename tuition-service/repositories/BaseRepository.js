class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async count(filter = {}) {
    return await this.model.count({
      where: filter,
    });
  }
  
  async findOne(filter = {}, options = {}) {
    return await this.model.findFirst({
      where: filter,
      include: options.include || undefined,
    });
  }

  async findMany(filter = {}, options = {}) {
    return await this.model.findMany({
      where: filter,
      skip: options.skip,
      take: options.take,
      orderBy: options.orderBy,
      include: options.include || undefined,
    });
  }

  async createOne(data) {
    return await this.model.create({ data });
  }

  async updateById(idField, id, data) {
    return await this.model.update({
      where: { [idField]: id },
      data,
    });
  }

  async deleteById(idField, id) {
    return await this.model.delete({
      where: { [idField]: id },
    });
  }
}

export default BaseRepository;
