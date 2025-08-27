class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(filter = {}, options = {}) {
    return await this.model.find(filter, null, options);
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findOne(filter = {}) {
    return await this.model.findOne(filter);
  }

  async createOne(data) {
    return await this.model.create(data);
  }

  async updateById(id, data) {
    return await this.model.updateOne({ _id: id }, data, {
      new: true,
      runValidators: true
    })
  }

  async deleteById(id) {
    return await this.model.deleteOne({ _id: id })
  }
}

export default BaseRepository;