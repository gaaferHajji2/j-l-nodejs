const postService = require('../services/post.service');

class PostController {
  // Get all posts (returns only necessary columns)
  async getAllPosts(req, res) {
    try {
      const posts = await postService.getAllPosts();
      res.json({
        success: true,
        data: posts,
        message: 'Posts retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get post by ID (returns all detailed information)
  async getPostById(req, res) {
    try {
      const { id } = req.params;
      const post = await postService.getPostById(id);
      
      res.json({
        success: true,
        data: post,
        message: 'Post retrieved successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create new post
  async createPost(req, res) {
    try {
      const post = await postService.createPost(req.body);
      
      res.status(201).json({
        success: true,
        data: post,
        message: 'Post created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update post
  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const post = await postService.updatePost(id, req.body);
      
      res.json({
        success: true,
        data: post,
        message: 'Post updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete post
  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const result = await postService.deletePost(id);
      
      res.status(204).json({
        success: true,
        data: result,
        message: 'Post deleted successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Add tags to post (Many-to-Many relationship)
  async addTagsToPost(req, res) {
    try {
      const { id } = req.params;
      const { tagIds } = req.body;
      
      if (!Array.isArray(tagIds)) {
        return res.status(400).json({
          success: false,
          message: 'tagIds must be an array'
        });
      }
      
      const post = await postService.addTagsToPost(id, tagIds);
      
      res.json({
        success: true,
        data: post,
        message: 'Tags added to post successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get published posts with pagination
  async getPublishedPosts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await postService.getPublishedPosts(page, limit);
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Published posts retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PostController();