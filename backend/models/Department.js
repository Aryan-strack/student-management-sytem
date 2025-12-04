const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentName: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    unique: true
  },
  departmentCode: {
    type: String,
    required: [true, 'Department code is required'],
    trim: true,
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{2,6}$/, 'Department code must be 2-6 uppercase letters']
  },
  headOfDepartment: {
    name: {
      type: String,
      required: [true, 'Head of department name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Head of department email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Head of department phone is required'],
      trim: true
    },
    qualification: {
      type: String,
      trim: true
    }
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    lowercase: true,
    trim: true
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    trim: true
  },
  establishmentYear: {
    type: Number,
    required: [true, 'Establishment year is required'],
    min: [1900, 'Establishment year must be after 1900'],
    max: [new Date().getFullYear(), 'Establishment year cannot be in the future']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  totalFaculty: {
    type: Number,
    default: 0,
    min: [0, 'Total faculty cannot be negative']
  },
  totalStudents: {
    type: Number,
    default: 0,
    min: [0, 'Total students cannot be negative']
  },
  location: {
    building: String,
    floor: String,
    room: String
  },
  facilities: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Under Maintenance'],
    default: 'Active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for department age
departmentSchema.virtual('age').get(function() {
  const currentYear = new Date().getFullYear();
  return currentYear - this.establishmentYear;
});

// Indexes
departmentSchema.index({ departmentCode: 1 }, { unique: true });
departmentSchema.index({ departmentName: 1 }, { unique: true });
departmentSchema.index({ status: 1 });
departmentSchema.index({ establishmentYear: 1 });

module.exports = mongoose.model('Department', departmentSchema);