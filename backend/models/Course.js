const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{2,4}\d{3,4}$/, 'Course code must be like CS101, MATH201, etc.']
  },
  creditHours: {
    type: Number,
    required: [true, 'Credit hours are required'],
    min: [1, 'Credit hours must be at least 1'],
    max: [6, 'Credit hours cannot exceed 6']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  instructor: {
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
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  semester: {
    type: String,
    enum: ['Fall', 'Spring', 'Summer', 'Winter'],
    required: [true, 'Semester is required']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1, 'Year must be at least 1'],
    max: [4, 'Year cannot exceed 4']
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
    room: String
  },
  maxStudents: {
    type: Number,
    min: [1, 'Maximum students must be at least 1'],
    max: [100, 'Maximum students cannot exceed 100']
  },
  enrolledStudents: {
    type: Number,
    default: 0,
    min: [0, 'Enrolled students cannot be negative']
  },
  courseType: {
    type: String,
    enum: ['Core', 'Elective', 'Lab', 'Project', 'Thesis'],
    default: 'Core'
  },
  gradingPolicy: {
    assignments: Number,
    midterm: Number,
    final: Number,
    projects: Number,
    attendance: Number
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Completed', 'Cancelled'],
    default: 'Active'
  },
  resources: [{
    type: {
      type: String,
      enum: ['Syllabus', 'Notes', 'Assignment', 'Reference', 'Video']
    },
    title: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for available seats
courseSchema.virtual('availableSeats').get(function() {
  return this.maxStudents - this.enrolledStudents;
});

// Virtual for course full status
courseSchema.virtual('isFull').get(function() {
  return this.enrolledStudents >= this.maxStudents;
});

// Indexes
courseSchema.index({ courseCode: 1 }, { unique: true });
courseSchema.index({ department: 1 });
courseSchema.index({ semester: 1 });
courseSchema.index({ year: 1 });
courseSchema.index({ courseType: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ 'instructor.name': 1 });

module.exports = mongoose.model('Course', courseSchema);