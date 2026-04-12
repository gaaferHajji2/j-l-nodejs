// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.post('/', commentController.createComment);
router.get('/', commentController.getAllComments);
router.get('/:id', commentController.getCommentById);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);
router.patch('/:id/approve', commentController.approveComment);

module.exports = router;