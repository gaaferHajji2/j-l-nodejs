I'll create a comprehensive Node.js + Mongoose example with all your requirements. This will be a complete, production-ready structure for a **Blog System** with Users, Posts, and Comments.

## Project Structure

```
blog-api/
├── config/
│   └── database.js
├── models/
│   ├── User.js
│   ├── Post.js
│   └── Comment.js
├── controllers/
│   ├── userController.js
│   ├── postController.js
│   └── commentController.js
├── routes/
│   ├── userRoutes.js
│   ├── postRoutes.js
│   └── commentRoutes.js
├── middleware/
│   └── errorHandler.js
├── utils/
│   └── validation.js
├── app.js
└── server.js
```

## 1. Configuration & Database Connection

```javascript
// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog_db', {
      // Mongoose 6+ doesn't need these options, but good for clarity
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

## 2. Models with Validation Rules

### User Model

```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    avatar: {
      type: String,
      default: 'default-avatar.png'
    }
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'author', 'admin'],
      message: 'Role must be either user, author, or admin'
    },
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName || ''} ${this.profile.lastName || ''}`.trim();
});

// Virtual populate for posts
userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author'
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);
```

### Post Model

```javascript
// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [10, 'Content must be at least 10 characters']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'published', 'archived'],
      message: 'Status must be draft, published, or archived'
    },
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  categories: [{
    type: String,
    trim: true
  }],
  featuredImage: {
    type: String
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Likes cannot be negative']
  },
  publishedAt: {
    type: Date
  },
  meta: {
    seoTitle: {
      type: String,
      maxlength: [70, 'SEO title cannot exceed 70 characters']
    },
    seoDescription: {
      type: String,
      maxlength: [160, 'SEO description cannot exceed 160 characters']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comment count
postSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  count: true
});

// Virtual for populated comments
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post'
});

// Pre-save middleware to generate slug
postSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Auto-generate excerpt from content if not provided
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 200) + (this.content.length > 200 ? '...' : '');
  }
  
  next();
});

// Index for common queries
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ author: 1 });
postSchema.index({ slug: 1 });

module.exports = mongoose.model('Post', postSchema);
```

### Comment Model

```javascript
// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post reference is required'],
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
    index: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Likes cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Status must be pending, approved, or rejected'
    },
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for replies (nested comments)
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

// Pre-save middleware to track edits
commentSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    // Save previous content to history
    this.editHistory.push({
      content: this._originalContent,
      editedAt: new Date()
    });
    this.isEdited = true;
  }
  next();
});

// Store original content before modification
commentSchema.pre('findOneAndUpdate', async function(next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    this._originalContent = doc.content;
  }
  next();
});

// Index for efficient querying
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });

module.exports = mongoose.model('Comment', commentSchema);
```

## 3. Controllers with Selective Field Logic

### User Controller

```javascript
// controllers/userController.js
const User = require('../models/User');

// Fields to select when getting all users (lightweight)
const USER_LIST_FIELDS = 'username email profile.firstName profile.lastName role isActive createdAt';
// Fields to exclude when getting user by ID (security)
const USER_EXCLUDE_FIELDS = '-password -__v';

exports.createUser = async (req, res, next) => {
  try {
    const { username, email, password, profile, role } = req.body;
    
    const user = await User.create({
      username,
      email,
      password,
      profile,
      role
    });
    
    // Return user without password
    const userResponse = await User.findById(user._id).select(USER_EXCLUDE_FIELDS);
    
    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL - Select specific fields only
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;
    
    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const users = await User.find(filter)
      .select(USER_LIST_FIELDS)  // Select only specific fields
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await User.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: users.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// GET BY ID - Display all fields (except sensitive ones)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select(USER_EXCLUDE_FIELDS)  // Exclude password and version
      .populate({
        path: 'posts',
        select: 'title slug status createdAt views',
        match: { status: 'published' },
        options: { sort: { createdAt: -1 }, limit: 5 }
      });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    // Prevent updating sensitive fields directly
    const updates = { ...req.body };
    delete updates.password;
    delete updates.role; // Only admin should change role
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select(USER_EXCLUDE_FIELDS);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Optional: Cascade delete user's posts and comments
    await Post.deleteMany({ author: req.params.id });
    await Comment.deleteMany({ author: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'User and associated data deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
```

### Post Controller

```javascript
// controllers/postController.js
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Fields for list view (lightweight)
const POST_LIST_FIELDS = 'title slug excerpt author status tags views likes createdAt publishedAt';
// Fields to exclude in detail view
const POST_EXCLUDE_FIELDS = '-__v';

exports.createPost = async (req, res, next) => {
  try {
    const post = await Post.create({
      ...req.body,
      author: req.body.author || req.user?.id // Fallback to authenticated user
    });
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username profile.firstName profile.lastName');
    
    res.status(201).json({
      success: true,
      data: populatedPost
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL - Select specific fields only
exports.getAllPosts = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'published', 
      author, 
      tag,
      category,
      search 
    } = req.query;
    
    // Build filter
    const filter = { status };
    if (author) filter.author = author;
    if (tag) filter.tags = { $in: [tag] };
    if (category) filter.categories = { $in: [category] };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const posts = await Post.find(filter)
      .select(POST_LIST_FIELDS)  // Select specific fields only
      .populate('author', 'username profile.firstName profile.lastName')  // Populate with limited fields
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ publishedAt: -1, createdAt: -1 });
    
    const count = await Post.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: posts.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

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
      });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Increment views (optional: use findOneAndUpdate to avoid validation)
    post.views += 1;
    await post.save({ validateBeforeSave: false });
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// Get post by slug (for frontend)
exports.getPostBySlug = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, status: 'published' })
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
      });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    post.views += 1;
    await post.save({ validateBeforeSave: false });
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'username');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Delete associated comments
    await Comment.deleteMany({ post: req.params.id });
    
    await post.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Post and associated comments deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
```

### Comment Controller

```javascript
// controllers/commentController.js
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Fields for list view
const COMMENT_LIST_FIELDS = 'content author post status likes createdAt isEdited';
const COMMENT_EXCLUDE_FIELDS = '-__v';

exports.createComment = async (req, res, next) => {
  try {
    const { content, postId, parentCommentId } = req.body;
    
    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // If parent comment provided, verify it exists and belongs to same post
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment || parentComment.post.toString() !== postId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent comment'
        });
      }
    }
    
    const comment = await Comment.create({
      content,
      post: postId,
      author: req.body.author || req.user?.id,
      parentComment: parentCommentId || null
    });
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username profile.avatar')
      .populate('post', 'title slug');
    
    res.status(201).json({
      success: true,
      data: populatedComment
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL - Select specific fields
exports.getAllComments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, postId, status, authorId } = req.query;
    
    const filter = {};
    if (postId) filter.post = postId;
    if (status) filter.status = status;
    if (authorId) filter.author = authorId;
    
    const comments = await Comment.find(filter)
      .select(COMMENT_LIST_FIELDS)
      .populate('author', 'username profile.avatar')
      .populate('post', 'title slug')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await Comment.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: comments.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: comments
    });
  } catch (error) {
    next(error);
    }
};

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
        match: { status: 'approved' },
        populate: {
          path: 'author',
          select: 'username profile.avatar'
        },
        options: { sort: { createdAt: 1 } }
      });
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Store original content before update
    if (content && content !== comment.content) {
      comment.editHistory.push({
        content: comment.content,
        editedAt: new Date()
      });
      comment.content = content;
      comment.isEdited = true;
    }
    
    await comment.save();
    
    const updatedComment = await Comment.findById(comment._id)
      .populate('author', 'username profile.avatar');
    
    res.status(200).json({
      success: true,
      data: updatedComment
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // If comment has replies, soft delete by marking as rejected
    const replyCount = await Comment.countDocuments({ parentComment: req.params.id });
    
    if (replyCount > 0) {
      comment.status = 'rejected';
      comment.content = '[This comment has been deleted]';
      await comment.save();
      
      return res.status(200).json({
        success: true,
        message: 'Comment soft deleted (has replies)'
      });
    }
    
    await comment.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Approve comment (admin only)
exports.approveComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('author', 'username');
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};
```

## 4. Routes

```javascript
// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
```

```javascript
// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/', postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/slug/:slug', postController.getPostBySlug);
router.get('/:id', postController.getPostById);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

module.exports = router;
```

```javascript
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
```

## 5. Main Application Setup

```javascript
// app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');

// Route imports
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

// Error handler
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
```

```javascript
// server.js
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});
```

## 6. Error Handler Middleware

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field} already exists`;
    return res.status(400).json({
      success: false,
      message: error.message,
      field: field
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
```

## 7. Package.json

```json
{
  "name": "blog-api-mongoose",
  "version": "1.0.0",
  "description": "Node.js + Mongoose example with 3 models and populate",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node utils/seed.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "mongoose": "^8.0.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## Key Features Implemented

| Feature | Implementation |
|---------|---------------|
| **3 Models** | User, Post, Comment with relationships |
| **Populate** | Used in `getById` methods for full data, avoided in list views for performance |
| **Selective Fields** | `POST_LIST_FIELDS` vs full document in `getPostById` |
| **Validation** | Schema-level validators, custom messages, enum constraints |
| **Virtuals** | `fullName`, `posts`, `comments`, `commentCount` |
| **Indexes** | Optimized for common query patterns |
| **Middleware** | Pre-save hooks for slug generation, password hashing |
| **Soft Delete** | Comments with replies are marked rejected instead of deleted |

## Usage Examples

```bash
# Install dependencies
npm install

# Start server
npm run dev

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"secure123","profile":{"firstName":"John","lastName":"Doe"}}'

# Get all users (lightweight fields)
curl http://localhost:3000/api/users

# Get user by ID (full data with posts populated)
curl http://localhost:3000/api/users/USER_ID_HERE

# Create a post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Post","content":"This is the content...","author":"USER_ID"}'

# Get post by ID (full populate with comments)
curl http://localhost:3000/api/posts/POST_ID_HERE

# Get post by slug (nested populate with comment replies)
curl http://localhost:3000/api/posts/slug/my-first-post
```

This example demonstrates professional-grade Mongoose patterns including field selection strategies, efficient population, comprehensive validation, and proper error handling.