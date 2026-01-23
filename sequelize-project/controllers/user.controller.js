const userService = require('../services/user.service');

class UserController {
  // Get all users (returns only necessary columns)
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.json({
        success: true,
        data: users,
        message: 'Users retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user by ID (returns all detailed information)
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      
      res.json({
        success: true,
        data: user,
        message: 'User retrieved successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create new user
  async createUser(req, res) {
    try {
      const { user, profile } = req.body;
      const newUser = await userService.createUser(user, profile);
      
      res.status(201).json({
        success: true,
        data: newUser,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error("stack is: ", error.stack)
      console.log("-".repeat(25))
      console.error("error is: ", error)
      res.status(400).json({
        success: false,
        message: error.message,
        status: error.status
      });
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { user, profile } = req.body;
      const updatedUser = await userService.updateUser(id, user, profile);
      
      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      
      res.json({
        success: true,
        // data: result,
        message: 'User deleted successfully'
      }).status(204);
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user's posts
  async getUserPosts(req, res) {
    try {
      const { id } = req.params;
      const posts = await userService.getUserPosts(id);
      
      res.json({
        success: true,
        data: posts,
        message: 'User posts retrieved successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserController();