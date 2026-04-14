// controllers/postController.js
const Post = require('../models/post')
const Comment = require('../models/comment')

// Fields for list view (lightweight)
const POST_LIST_FIELDS = 'title slug excerpt author status tags views likes createdAt publishedAt'

// Fields to exclude in detail view
const POST_EXCLUDE_FIELDS = '-__v'

exports.createPost = async (req, res, next) => {
  try {
    delete req.body.views;
    delete req.body.likes;

    const post = await Post.create({
      ...req.body,
      author: req.body.author || req.user?.id // Fallback to authenticated user
    })
    
    // const populatedPost = await Post.findById(post._id)
    //   .populate('author', 'username profile.firstName profile.lastName')
    
    res.status(201).json({
      success: true,
      data: post
    })
  } catch (error) {
    next(error)
  }
}

// GET ALL - Select specific fields only
exports.getAllPosts = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'draft', 
      author, 
      tag,
      category,
      search 
    } = req.query
    
    // Build filter
    const filter = { status }
    if (author) filter.author = author
    if (tag) filter.tags = { $in: [tag] }
    if (category) filter.categories = { $in: [category] }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }
    
    const posts = await Post.find(filter)
      .select(POST_LIST_FIELDS)  // Select specific fields only
      .populate('author', 'username profile.firstName profile.lastName')  // Populate with limited fields
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ publishedAt: -1, createdAt: -1 })
    
    const count = await Post.countDocuments(filter)
    
    res.status(200).json({
      success: true,
      count: posts.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: posts
    })
  } catch (error) {
    next(error)
  }
}

// GET BY ID - Display all fields with full population
exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .select(POST_EXCLUDE_FIELDS)  // Exclude version key only
      .populate({
        path: 'author',
        select: '-password -__v -email',  // Exclude sensitive fields
      })
      .populate({
        path: 'comments',
        match: { status: 'approved', parentComment: null },
        populate: {
          path: 'author',
          select: 'username profile.avatar'
        },
        options: { sort: { createdAt: -1 } }
      })
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }
    
    // Increment views (optional: use findOneAndUpdate to avoid validation)
    post.views += 1
    await post.save({ validateBeforeSave: false })
    
    res.status(200).json({
      success: true,
      data: post
    })
  } catch (error) {
    next(error)
  }
}

// Get post by slug (for frontend)
exports.getPostBySlug = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .select(POST_EXCLUDE_FIELDS)
      .populate({
        path: 'author',
        select: 'username profile.firstName profile.lastName profile.bio profile.avatar role'
      })
      .populate({
        path: 'comments',
        match: { status: 'approved', parentComment: null },
        populate: [
          {
            path: 'author',
            select: 'username profile.avatar'
          },
          {
            path: 'replies',
            match: { status: 'approved' },
            populate: {
              path: 'author',
              select: 'username profile.avatar'
            }
          }
        ],
        options: { sort: { createdAt: -1 } }
      })
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }
    
    post.views += 1
    await post.save({ validateBeforeSave: false })
    
    res.status(200).json({
      success: true,
      data: post
    })
  } catch (error) {
    next(error)
  }
}

exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'username')
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: post
    })
  } catch (error) {
    next(error)
  }
}

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }
    
    // Delete associated comments
    await Comment.deleteMany({ post: req.params.id })
    
    await post.deleteOne()
    
    res.status(200).json({
      success: true,
      message: 'Post and associated comments deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}
