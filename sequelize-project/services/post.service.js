const postRepository = require('../repositories/post.repository');
const userRepository = require('../repositories/user.repository');

class PostService {
  // Get all posts with minimal data
  async getAllPosts() {
    return await postRepository.findAllPosts();
  }

  // Get post by ID with all details
  async getPostById(id) {
    const post = await postRepository.findPostById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    return post;
  }

  // Create new post
  async createPost(postData) {
    // Verify user exists
    const user = await userRepository.findById(postData.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await postRepository.create(postData);
  }

  // Update post
  async updatePost(id, postData) {
    const post = await postRepository.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }

    return await postRepository.update(id, postData);
  }

  // Delete post
  async deletePost(id) {
    const deleted = await postRepository.delete(id);
    if (!deleted) {
      throw new Error('Post not found');
    }
    return { message: 'Post deleted successfully' };
  }

  // Add tags to post (Many-to-Many relationship)
  async addTagsToPost(postId, tagIds) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // Verify all tags exist
    const Tag = require('../models').Tag;
    const tags = await Tag.findAll({
      where: { id: tagIds }
    });

    if (tags.length !== tagIds.length) {
      throw new Error('One or more tags not found');
    }

    return await postRepository.addTagsToPost(postId, tagIds);
  }

  // Get published posts with pagination
  async getPublishedPosts(page = 1, limit = 10) {
    return await postRepository.findPublishedPosts(page, limit);
  }
}

module.exports = new PostService();