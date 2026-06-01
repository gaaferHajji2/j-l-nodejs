import { Router } from 'express'
import { createTaskValidation, handleValidationErrors } from '../middleware/task.middleware'
import Task from '../models/Task'

router = Router()

router.post('/', createTaskValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, description, user_id } = req.body;

    const newTask = await Task.create({
      name,
      description,
      user_id,
    });

    res.status(201).json({
      success: true,
      data: newTask,
    });
  } catch (error) {
    // Handle Mongoose validation errors or other DB errors
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
})

export default router