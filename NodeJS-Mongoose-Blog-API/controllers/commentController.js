// controllers/commentController.js
const Comment = require('../models/comment')
const Post = require('../models/post')

// Fields for list view
const COMMENT_LIST_FIELDS = 'content author post status likes createdAt isEdited'
const COMMENT_EXCLUDE_FIELDS = '-__v'

exports.createComment = async (req, res, next) => {
  try {
    const { content, postId, parentCommentId } = req.body
    
    // Verify post exists
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }
    
    // If parent comment provided, verify it exists and belongs to same post
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId)
      if (!parentComment || parentComment.post.toString() !== postId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent comment'
        })
      }
    }
    
    const comment = await Comment.create({
      content,
      post: postId,
      author: req.body.author || req.user?.id,
      parentComment: parentCommentId || null
    })
    
    // const populatedComment = await Comment.findById(comment._id)
    //   .populate('author', 'username profile.avatar')
    //   .populate('post', 'title slug')
    
    res.status(201).json({
      success: true,
      data: comment
    })
  } catch (error) {
    next(error)
  }
}

// GET ALL - Select specific fields
exports.getAllComments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, postId, status, authorId } = req.query
    
    const filter = {}
    if (postId) filter.post = postId
    if (status) filter.status = status
    if (authorId) filter.author = authorId
    
    const comments = await Comment.find(filter)
      .select(COMMENT_LIST_FIELDS)
      .populate('author', 'username profile.avatar')
      .populate('post', 'title slug')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
    
    const count = await Comment.countDocuments(filter)
    
    res.status(200).json({
      success: true,
      count: comments.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: comments
    })
  } catch (error) {
    next(error)
    }
}

// GET BY ID - Full details with nested population
exports.getCommentById = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .select(COMMENT_EXCLUDE_FIELDS)
      .populate({
        path: 'author',
        select: 'username profile.firstName profile.lastName profile.avatar role createdAt'
      })
      .populate({
        path: 'post',
        select: 'title slug author',
        populate: {
          path: 'author',
          select: 'username'
        }
      })
      .populate({
        path: 'parentComment',
        select: 'content author createdAt',
        populate: {
          path: 'author',
          select: 'username'
        }
      })
      .populate({
        path: 'replies',
        // match: { status: 'approved' },
        populate: {
          path: 'author',
          select: 'username profile.avatar'
        },
        options: { sort: { createdAt: 1 } }
      })
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: comment
    })
  } catch (error) {
    next(error)
  }
}

exports.updateComment = async (req, res, next) => {
  try {
    const { content } = req.body
    
    const comment = await Comment.findById(req.params.id)
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      })
    }
    
    // Store original content before update
    if (content && content !== comment.content) {
      comment.content = content
      await comment.save()
    }
    
    res.status(200).json({
      success: true,
      data: comment
    })
  } catch (error) {
    next(error)
  }
}

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      })
    }
    
    // If comment has replies, soft delete by marking as rejected
    const replyCount = await Comment.countDocuments({ parentComment: req.params.id })
    
    if (replyCount > 0) {
      comment.status = 'rejected'
      comment.content = '[This comment has been deleted]'
      await comment.save()
      
      return res.status(200).json({
        success: true,
        message: 'Comment soft deleted (has replies)'
      })
    }
    
    await comment.deleteOne()
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

// Approve comment (admin only)
exports.approveComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('author', 'username')
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: comment
    })
  } catch (error) {
    next(error)
  }
}