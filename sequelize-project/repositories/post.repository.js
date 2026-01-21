const BaseRepository = require('./base.repository');

class PostRepository extends BaseRepository {
  constructor() {
    super(require('../models').Post);
  }

  // Get all posts with only specific columns
  async findAllPosts() {
    return await this.findAll({
      attributes: ['id', 'title', 'isPublished', 'createdAt', 'userId'],
      include: [
        {
          model: require('../models').User,
          as: 'author',
          attributes: ['id', 'username'] // Only specific columns from user
        },
        {
          model: require('../models').Tag,
          as: 'tags',
          attributes: ['id', 'name'], // Only specific columns from tags
          through: { attributes: [] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  // Get post by ID with all detailed information
  async findPostById(id) {
    return await this.findById(id, {
      include: [
        {
          model: require('../models').User,
          as: 'author',
          include: [
            {
              model: require('../models').Profile,
              as: 'profile'
            }
          ]
        },
        {
          model: require('../models').Tag,
          as: 'tags'
        }
      ]
    });
  }

  async findPublishedPosts(page = 1, limit = 10) {
    return await this.paginate(page, limit, {
      where: { isPublished: true },
      attributes: ['id', 'title', 'createdAt'],
      include: [
        {
          model: require('../models').User,
          as: 'author',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async addTagsToPost(postId, tagIds) {
    const post = await this.findById(postId);
    if (!post) return null;
    
    await post.setTags(tagIds);
    return await this.findPostById(postId);
  }
}

module.exports = new PostRepository();