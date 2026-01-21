const express = require('express');
const router = express.Router();

// Import controllers
const userController = require('../controllers/user.controller');
const postController = require('../controllers/post.controller');

// User routes
router.get('/users', userController.getAllUsers); // Get all users (minimal data)
router.get('/users/:id', userController.getUserById); // Get user by ID (detailed)
router.post('/users', userController.createUser); // Create user with profile
router.put('/users/:id', userController.updateUser); // Update user and profile
router.delete('/users/:id', userController.deleteUser); // Delete user (cascade)
router.get('/users/:id/posts', userController.getUserPosts); // Get user's posts

// Post routes
router.get('/posts', postController.getAllPosts); // Get all posts (minimal data)
router.get('/posts/published', postController.getPublishedPosts); // Get published posts
router.get('/posts/:id', postController.getPostById); // Get post by ID (detailed)
router.post('/posts', postController.createPost); // Create post
router.put('/posts/:id', postController.updatePost); // Update post
router.delete('/posts/:id', postController.deletePost); // Delete post
router.post('/posts/:id/tags', postController.addTagsToPost); // Add tags to post (Many-to-Many)

module.exports = router;