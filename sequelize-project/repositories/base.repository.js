class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    return await this.model.findAll(options);
  }

  async findById(id, options = {}) {
    return await this.model.findByPk(id, options);
  }

  async findOne(where, options = {}) {
    return await this.model.findOne({ where, ...options });
  }

  async create(data, options = {}) {
    return await this.model.create(data, options);
  }

  async update(id, data, options = {}) {
    const instance = await this.findById(id);
    if (!instance) return null;
    
    return await instance.update(data, options);
  }

  async delete(id, options = {}) {
    const instance = await this.findById(id);
    if (!instance) return false;
    
    await instance.destroy(options);
    return true;
  }

  async paginate(page = 1, limit = 10, options = {}) {
    const offset = (page - 1) * limit;
    const result = await this.model.findAndCountAll({
      ...options,
      limit,
      offset,
      distinct: true
    });
    
    return {
      data: result.rows,
      pagination: {
        total: result.count,
        page,
        limit,
        totalPages: Math.ceil(result.count / limit)
      }
    };
  }
}

module.exports = BaseRepository;