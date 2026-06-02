import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
	{
		// task name: required, trimmed, with a max length
		name: {
			type: String,
			required: [true, 'Task name is required'],
			trim: true,
			maxlength: [100, 'Task name cannot be more than 100 characters'],
		},
		// task description: optional, but trimmed
		description: {
			type: String,
			trim: true,
			maxlength: [500, 'Description cannot be more than 500 characters'],
		},
		// user_id: reference to the User model, required
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, 'User ID is required'],
			index: true, // Indexing for faster queries by user
		},
	},
	{
		timestamps: true, // Automatically adds createdAt and updatedAt fields
	}
);

// Optional: Add a compound index if you often query tasks by user and creation date
taskSchema.index({ user_id: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;