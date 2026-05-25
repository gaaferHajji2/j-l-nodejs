import express from 'express'
import _ from 'lodash'
import User from "../models/user.model.js"
import { registerValidationRules, handleValidationErrors } from "../middleware/userValidation.middleware.js"

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

export default router