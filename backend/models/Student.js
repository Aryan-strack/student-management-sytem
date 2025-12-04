const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9]+$/, 'Please enter a valid roll number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10,11}$/, 'Please enter a valid phone number']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    }
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Gender is required']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Graduated', 'Suspended'],
    default: 'Active'
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true
  },
  guardianInfo: {
    name: {
      type: String,
      required: [true, 'Guardian name is required'],
      trim: true
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Guardian phone is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  photo: {
    type: String,
    default: 'default-avatar.png'
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
studentSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Virtual for age calculation
studentSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Update timestamps
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Cascade delete students when class is deleted
studentSchema.pre('deleteMany', { document: false, query: true }, async function(next) {
  const doc = await this.model.find(this.getFilter());
  console.log(`Deleting ${doc.length} students...`);
  next();
});

// Indexes for better query performance
studentSchema.index({ rollNumber: 1 }, { unique: true });
studentSchema.index({ email: 1 }, { unique: true });
studentSchema.index({ name: 1 });
studentSchema.index({ class: 1 });
studentSchema.index({ department: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ 'address.city': 1 });

module.exports = mongoose.model('Student', studentSchema);