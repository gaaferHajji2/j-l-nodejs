const BaseRepository = require('./base.repository');

class UserRepository extends BaseRepository {
  constructor() {
    super(require('../models').User);
    //console.log("Setting the base model to: User")
  }

  // Get all users with only specific columns for listing
  async findAllUsers(includeAssociations = false) {
    const options = {
      attributes: ['id', 'username', 'email', 'createdAt'], // Only necessary columns
      order: [['createdAt', 'DESC']]
    };

    if (includeAssociations) {
      options.include = [
        {
          model: require('../models').Profile,
          as: 'profile',
          attributes: ['firstName', 'lastName'] // Only specific columns from profile
        },
        {
          model: require('../models').Post,
          as: 'posts',
          attributes: ['id', 'title', 'isPublished'], // Only specific columns from posts
          required: false // LEFT JOIN instead of INNER JOIN
        }
      ];
    }

    return await this.findAll(options);
  }

  // Get user by ID with all detailed information
  async findUserById(id) {
    return await this.findById(id, {
      include: [
        {
          model: require('../models').Profile,
          as: 'profile'
          // All columns from profile (no attributes specified)
        },
        {
          model: require('../models').Post,
          as: 'posts',
        //   include: [
        //     {
        //       model: require('../models').Tag,
        //       as: 'tags',
        //       through: { attributes: [] } // Hide junction table attributes
        //     }
        //   ]
        }
      ]
    });
  }

  async findUserWithPosts(id) {
    return await this.findById(id, {
      attributes: ['id', 'username', 'email'],
      include: [
        {
          model: require('../models').Post,
          as: 'posts',
          attributes: ['id', 'title', 'createdAt'],
          where: { isPublished: true }
        }
      ]
    });
  }

  async findUsersByEmail(email) {
    return await this.findAll({
      where: { email },
      attributes: ['id', 'username', 'email']
    });
  }
}

module.exports = new UserRepository();