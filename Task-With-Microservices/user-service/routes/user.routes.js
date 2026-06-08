import express from 'express'
import _ from 'lodash'
import User from "../models/user.model.js"
import { registerValidationRules, handleValidationErrors } from "../middleware/userValidation.middleware.js"
import checkId from '../middleware/checkId.middleware/checkId.middleware.js'

let router = express.Router()

router.post("/", registerValidationRules, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists (optional but recommended)
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user (Mongoose pre-save hook will hash the password)
    const user = await User.create({
      name,
      email,
      password
    });

    // Send response (password is excluded automatically due to select: false in schema)
    res.status(201).json({
      success: true,
      data: _.pick(user, 'name', 'email', '_id', 'createdAt', 'updatedAt')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
})

router.get("/", async (req, res) => {
  try {
    // Extract query parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt"; // Default sort field
    const order = req.query.order === "asc" ? 1 : -1; // 1 for asc, -1 for desc

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = order;

    // Execute query with pagination and sorting
    const users = await User.find({})
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Optional: Get total count for metadata (useful for frontend pagination)
    const totalUsers = await User.countDocuments();

    return res.status(200).json({
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit,
      },
    });
  } catch (error) {
    throw error
  }
})

router.get('/:id/exists', checkId, async (req, res) => {
  try {
    return res.json({ 
      exists: await User.exists({ _id: req.params.id }) 
    });
  } catch (e) {
    return res.status(500).json({
      error: e
    })
  }
})

export default router