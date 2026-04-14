const mongoose = require('mongoose')

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
})

// Virtual for replies (nested comments)
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
})

// Pre-save middleware to track edits
commentSchema.pre('save', function() {
  if (this.isModified('content') && !this.isNew) {
    // Save previous content to history
    this.editHistory.push({
      content: this._originalContent,
      editedAt: new Date()
    })
    this.isEdited = true
  }
})

// Store original content before modification
// commentSchema.pre('findOneAndUpdate', async function() {
//   const doc = await this.model.findOne(this.getQuery())
//   if (doc) {
//     this._originalContent = doc.content
//     if (this.isModified('content') && !this.isNew) {
//       // Save previous content to history
//       this.editHistory.push({
//         content: this._originalContent,
//         editedAt: new Date()
//       })
//       this.isEdited = true
//     }
//   }
// })

// Index for efficient querying
commentSchema.index({ post: 1, createdAt: -1 })
// commentSchema.index({ author: 1 })
// commentSchema.index({ parentComment: 1 })

module.exports = mongoose.model('Comment', commentSchema)