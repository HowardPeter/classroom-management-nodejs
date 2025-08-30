class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async count(filter = {}) {
    return await this.model.count({
      where: filter,
    });
  }

  async findOne(filter = {}) {
    return await this.model.findFirst({
      where: filter,
    });
  }

  async findMany(filter = {}, options = {}) {
    return await this.model.findMany({
      where: filter,
      skip: options.skip,
      take: options.take,
      orderBy: options.orderBy,
      include: options.include || undefined
    });
  }

  async createOne(data) {
    return await this.model.create({ data: data });
  }

  async updateOne(filter = {}, data) {
    return await this.model.update({
      where: filter,
      data: data,
    });
  }

  async updateMany(filter = {}, data) {
    return await this.model.updateMany({
      where: filter,
      data: data,
    });
  }

  async deleteOne(filter = {}) {
    return await this.model.delete({
      where: filter,
    });
  }

  async deleteMany(filter = {}) {
    return await this.model.deleteMany({
      where: filter,
    });
  }
}

export default BaseRepository;