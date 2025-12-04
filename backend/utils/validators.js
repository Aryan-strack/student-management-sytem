const { body, param, query, validationResult } = require('express-validator');

// Student validators
const studentValidators = {
  createStudent: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 3 }).withMessage('Name must be at least 3 characters')
      .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
    
    body('rollNumber')
      .trim()
      .notEmpty().withMessage('Roll number is required')
      .matches(/^[A-Z0-9]+$/).withMessage('Roll number must contain only uppercase letters and numbers'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email')
      .normalizeEmail(),
    
    body('phone')
      .trim()
      .notEmpty().withMessage('Phone number is required')
      .matches(/^[0-9]{10,11}$/).withMessage('Please enter a valid phone number (10-11 digits)'),
    
    body('dateOfBirth')
      .notEmpty().withMessage('Date of birth is required')
      .isISO8601().withMessage('Please enter a valid date (YYYY-MM-DD)')
      .custom((value) => {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 5 || age > 100) {
          throw new Error('Age must be between 5 and 100 years');
        }
        return true;
      }),
    
    body('gender')
      .trim()
      .notEmpty().withMessage('Gender is required')
      .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    
    body('class')
      .notEmpty().withMessage('Class is required')
      .isMongoId().withMessage('Invalid class ID'),
    
    body('department')
      .notEmpty().withMessage('Department is required')
      .isMongoId().withMessage('Invalid department ID'),
    
    body('academicYear')
      .trim()
      .notEmpty().withMessage('Academic year is required')
      .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in format YYYY-YYYY'),
    
    body('guardianInfo.name')
      .trim()
      .notEmpty().withMessage('Guardian name is required'),
    
    body('guardianInfo.relationship')
      .trim()
      .notEmpty().withMessage('Relationship is required'),
    
    body('guardianInfo.phone')
      .trim()
      .notEmpty().withMessage('Guardian phone is required')
      .matches(/^[0-9]{10,11}$/).withMessage('Please enter a valid phone number'),
    
    body('courses')
      .optional()
      .isArray().withMessage('Courses must be an array')
      .custom((courses) => {
        if (courses && courses.length > 0) {
          return courses.every(id => /^[0-9a-fA-F]{24}$/.test(id));
        }
        return true;
      }).withMessage('Invalid course IDs'),
    
    body('address.street').trim().notEmpty().withMessage('Street address is required'),
    body('address.city').trim().notEmpty().withMessage('City is required'),
    body('address.state').trim().notEmpty().withMessage('State is required'),
    body('address.zipCode').trim().notEmpty().withMessage('Zip code is required')
  ],

  updateStudent: [
    param('id')
      .isMongoId().withMessage('Invalid student ID'),
    
    body('email')
      .optional()
      .isEmail().withMessage('Please enter a valid email')
      .normalizeEmail(),
    
    body('phone')
      .optional()
      .matches(/^[0-9]{10,11}$/).withMessage('Please enter a valid phone number'),
    
    body('dateOfBirth')
      .optional()
      .isISO8601().withMessage('Please enter a valid date')
      .custom((value) => {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 5 || age > 100) {
          throw new Error('Age must be between 5 and 100 years');
        }
        return true;
      }),
    
    body('gender')
      .optional()
      .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
    
    body('status')
      .optional()
      .isIn(['Active', 'Inactive', 'Graduated', 'Suspended']).withMessage('Invalid status')
  ],

  getStudentById: [
    param('id')
      .isMongoId().withMessage('Invalid student ID')
  ],

  deleteStudent: [
    param('id')
      .isMongoId().withMessage('Invalid student ID')
  ],

  searchStudents: [
    query('name').optional().trim(),
    query('rollNumber').optional().trim(),
    query('email').optional().trim().normalizeEmail(),
    query('class').optional().isMongoId().withMessage('Invalid class ID'),
    query('department').optional().isMongoId().withMessage('Invalid department ID'),
    query('status').optional().isIn(['Active', 'Inactive', 'Graduated', 'Suspended']),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ]
};

// Class validators
const classValidators = {
  createClass: [
    body('className')
      .trim()
      .notEmpty().withMessage('Class name is required')
      .matches(/^[A-Z0-9]+$/).withMessage('Class name must contain only uppercase letters and numbers'),
    
    body('section')
      .trim()
      .notEmpty().withMessage('Section is required')
      .matches(/^[A-Z]$/).withMessage('Section must be a single uppercase letter'),
    
    body('academicYear')
      .trim()
      .notEmpty().withMessage('Academic year is required')
      .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in format YYYY-YYYY'),
    
    body('capacity')
      .notEmpty().withMessage('Capacity is required')
      .isInt({ min: 1, max: 100 }).withMessage('Capacity must be between 1 and 100'),
    
    body('department')
      .notEmpty().withMessage('Department is required')
      .isMongoId().withMessage('Invalid department ID')
  ]
};

// Department validators
const departmentValidators = {
  createDepartment: [
    body('departmentName')
      .trim()
      .notEmpty().withMessage('Department name is required')
      .isLength({ min: 2 }).withMessage('Department name must be at least 2 characters'),
    
    body('departmentCode')
      .trim()
      .notEmpty().withMessage('Department code is required')
      .matches(/^[A-Z]{2,6}$/).withMessage('Department code must be 2-6 uppercase letters'),
    
    body('headOfDepartment.name')
      .trim()
      .notEmpty().withMessage('Head of department name is required'),
    
    body('headOfDepartment.email')
      .trim()
      .notEmpty().withMessage('Head of department email is required')
      .isEmail().withMessage('Please enter a valid email'),
    
    body('headOfDepartment.phone')
      .trim()
      .notEmpty().withMessage('Head of department phone is required')
      .matches(/^[0-9]{10,11}$/).withMessage('Please enter a valid phone number'),
    
    body('establishmentYear')
      .notEmpty().withMessage('Establishment year is required')
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage(`Establishment year must be between 1900 and ${new Date().getFullYear()}`)
  ]
};

// Course validators
const courseValidators = {
  createCourse: [
    body('courseName')
      .trim()
      .notEmpty().withMessage('Course name is required'),
    
    body('courseCode')
      .trim()
      .notEmpty().withMessage('Course code is required')
      .matches(/^[A-Z]{2,4}\d{3,4}$/).withMessage('Course code must be like CS101, MATH201, etc.'),
    
    body('creditHours')
      .notEmpty().withMessage('Credit hours are required')
      .isFloat({ min: 1, max: 6 }).withMessage('Credit hours must be between 1 and 6'),
    
    body('department')
      .notEmpty().withMessage('Department is required')
      .isMongoId().withMessage('Invalid department ID'),
    
    body('semester')
      .trim()
      .notEmpty().withMessage('Semester is required')
      .isIn(['Fall', 'Spring', 'Summer', 'Winter']).withMessage('Invalid semester'),
    
    body('year')
      .notEmpty().withMessage('Year is required')
      .isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
    
    body('maxStudents')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Maximum students must be between 1 and 100')
  ]
};

// Validate middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = {};
    errors.array().forEach(err => {
      if (!extractedErrors[err.path]) {
        extractedErrors[err.path] = [];
      }
      extractedErrors[err.path].push(err.msg);
    });

    return res.status(400).json({
      success: false,
      errors: extractedErrors
    });
  };
};

module.exports = {
  studentValidators,
  classValidators,
  departmentValidators,
  courseValidators,
  validate
};