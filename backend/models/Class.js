const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
    unique: true,
    uppercase: true
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
    uppercase: true
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true,
    match: [/^\d{4}-\d{4}$/, 'Please enter academic year in format YYYY-YYYY']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [100, 'Capacity cannot exceed 100']
  },
  currentStrength: {
    type: Number,
    default: 0,
    min: [0, 'Current strength cannot be negative']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  classTeacher: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }],
    time: {
      start: String,
      end: String
    },
    roomNumber: String
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Completed'],
    default: 'Active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for class code (combination of class name and section)
classSchema.virtual('classCode').get(function() {
  return `${this.className}-${this.section}`;
});

// Virtual for available seats
classSchema.virtual('availableSeats').get(function() {
  return this.capacity - this.currentStrength;
});

// Check if class is full
classSchema.virtual('isFull').get(function() {
  return this.currentStrength >= this.capacity;
});

// Middleware to update current strength when students are added/removed
classSchema.pre('save', function(next) {
  // This would be updated by student operations
  next();
});

// Indexes
classSchema.index({ className: 1, section: 1 }, { unique: true });
classSchema.index({ department: 1 });
classSchema.index({ status: 1 });
classSchema.index({ academicYear: 1 });

module.exports = mongoose.model('Class', classSchema);