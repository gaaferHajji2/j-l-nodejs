const userRepository = require('../repositories/user.repository');
const postRepository = require('../repositories/post.repository');
const { Op } = require('sequelize')
const User = require("../models").User

class UserService {
  // Get all users with minimal data
  async getAllUsers() {
    return await userRepository.findAllUsers();
  }

  // Get user by ID with all details
  async getUserById(id) {
    const user = await userRepository.findUserById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  // Create new user with profile
  async createUser(userData, profileData) {    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [{username: userData.username}, {email: userData.email}] 
      } 
    });
    
    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    console.log("User not found")

    // Create user with profile using transaction
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const user = await userRepository.create(userData, { transaction });
      
      if (profileData) {
        await require('../models').Profile.create(
          { ...profileData, userId: user.id },
          { transaction }
        );
      }
      
      await transaction.commit();
      return await userRepository.findUserById(user.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Update user
  async updateUser(id, userData, profileData) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const transaction = await require('../models').sequelize.transaction();
    
    try {
      // Update user
      if (Object.keys(userData).length > 0) {
        await userRepository.update(id, userData, { transaction });
      }

      // Update profile
      if (profileData) {
        const profile = await require('../models').Profile.findOne({
          where: { userId: id },
          transaction
        });
        
        if (profile) {
          await profile.update(profileData, { transaction });
        } else {
          await require('../models').Profile.create(
            { ...profileData, userId: id },
            { transaction }
          );
        }
      }

      await transaction.commit();
      return await userRepository.findUserById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Delete user (cascade will delete profile and posts)
  async deleteUser(id) {
    const deleted = await userRepository.delete(id);
    if (!deleted) {
      throw new Error('User not found');
    }
    return { message: 'User deleted successfully' };
  }

  // Get user's posts
  async getUserPosts(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return await postRepository.findAll({
      where: { userId },
      attributes: ['id', 'title', 'isPublished', 'createdAt']
    });
  }
}

module.exports = new UserService();