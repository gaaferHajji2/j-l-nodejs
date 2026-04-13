// controllers/userController.js
const User = require('../models/user')

// Fields to select when getting all users (lightweight)
const USER_LIST_FIELDS = 'username email profile.firstName profile.lastName role isActive createdAt'
// Fields to exclude when getting user by ID (security)
const USER_EXCLUDE_FIELDS = '-password -__v'

exports.createUser = async (req, res, next) => {
  try {
    const { username, email, password, profile, role } = req.body

    const t1 = await User.findOne({
      $or: [
        { username },
        { email }
      ]
    })

    if(t1) {
        return res.status(400).json({
            status: false,
            'msg': 'Username or Email Aleardy Exists'
        })
    }
    
    const user = await User.create({
      username,
      email,
      password,
      profile,
      role
    })
    
    // Return user without password
    // const userResponse = await User.findById(user._id).select(USER_EXCLUDE_FIELDS)
    
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username, 
        email: user.email,
        firstName:  user.profile.firstName, 
        lastName: user.profile.lastName,
        role: user.role, 
        isActive: user.isActive, 
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    next(error)
  }
}

// GET ALL - Select specific fields only
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query
    
    // Build filter
    const filter = {}
    if (role) filter.role = role
    if (isActive !== undefined) filter.isActive = isActive === 'true'
    
    const users = await User.find(filter)
      .select(USER_LIST_FIELDS)  // Select only specific fields
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
    
    const count = await User.countDocuments(filter)
    
    res.status(200).json({
      success: true,
      count: users.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: users
    })
  } catch (error) {
    next(error)
  }
}

// GET BY ID - Display all fields (except sensitive ones)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select(USER_EXCLUDE_FIELDS)  // Exclude password and version
      .populate({
        path: 'posts',
        select: 'title slug status createdAt views',
        // match: { status: 'published' },
        options: { sort: { createdAt: -1 }, limit: 5 }
      })
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

exports.updateUser = async (req, res, next) => {
  try {
    // Prevent updating sensitive fields directly
    const updates = { ...req.body }
    delete updates.password
    delete updates.role // Only admin should change role
    delete updates.email // Don't allow the user to change his/her email
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select(USER_EXCLUDE_FIELDS)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    // Optional: Cascade delete user's posts and comments
    await Post.deleteMany({ author: req.params.id })
    await Comment.deleteMany({ author: req.params.id })
    
    res.status(200).json({
      success: true,
      message: 'User and associated data deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}