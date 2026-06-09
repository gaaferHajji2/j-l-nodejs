import { Router } from 'express'
import { createTaskValidation, handleValidationErrors } from '../middleware/task.middleware.js'
import Task from '../models/task.model.js'
import amqp from 'amqplib'


const router = Router()

let channel, connection;

async function connectToRabbitMQ(retries = 3) {
    while(retries){
        try {
            connection = await amqp.connect(process.env.RABBITMQ_URL)
            channel = await connection.createChannel()
            await channel.assertQueue("task_created")
            console.log("Connection To RabbitMQ Successfully")

            return { connection, channel }
        } catch (e) {
            console.error("Error In RabbitMQ Connection: " + e.message)
            retries -= 1
            if(retries<=0){
                throw new Error("RabbitMQ Connection Failed")
            }
        }
    }
}

connectToRabbitMQ().then(()=> {}).catch(e => process.exit(1))

router.post('/', createTaskValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, description, user_id } = req.body;

    let response = await fetch(`http://user-service:3000/api/users/${user_id}/exists`)
    let tempUser = await response.json()

    if(response.status != 200 || tempUser.exists == null) {
      return res.status(400).json({
        'msg': 'Please check the UserId',
      })
    }

    const newTask = await Task.create({
      name,
      description,
      user_id,
    })

    let message = { taskId: newTask._id, user_id, title }

    res.status(201).json({
      success: true,
      data: newTask,
    })
  } catch (error) {
    // Handle Mongoose validation errors or other DB errors
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
})

router.get('/', async (req, res) => {
  try {
    // 1. Extract query parameters with defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || 'createdAt'; // Default sort by creation date
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1; // Default descending (newest first)

    // 2. Validate inputs
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page and limit must be positive integers',
      });
    }

    // Prevent sorting by arbitrary fields for security/performance
    const allowedSortFields = ['name', 'createdAt', 'updatedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    // 3. Calculate skip value
    const skip = (page - 1) * limit;

    // 4. Execute Query
    const [tasks, total] = await Promise.all([
      Task.find()
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit), // Optional: populate user details
      Task.countDocuments() // Get total count for pagination metadata
    ]);

    // 5. Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        limit,
        hasNextPage,
        hasPrevPage,
      },
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
})

export default router