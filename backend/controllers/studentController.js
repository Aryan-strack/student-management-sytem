const Student = require('../models/Student');
const Class = require('../models/Class');
const Department = require('../models/Department');
const Course = require('../models/Course');

/**
 * @desc    Get all students with pagination, filtering, and sorting
 * @route   GET /api/students
 * @access  Public
 */
exports.getAllStudents = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Filtering
    const filter = {};
    
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }
    if (req.query.rollNumber) {
      filter.rollNumber = { $regex: req.query.rollNumber, $options: 'i' };
    }
    if (req.query.email) {
      filter.email = { $regex: req.query.email, $options: 'i' };
    }
    if (req.query.class) {
      filter.class = req.query.class;
    }
    if (req.query.department) {
      filter.department = req.query.department;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.gender) {
      filter.gender = req.query.gender;
    }
    if (req.query.academicYear) {
      filter.academicYear = req.query.academicYear;
    }
    if (req.query.city) {
      filter['address.city'] = { $regex: req.query.city, $options: 'i' };
    }

    // Get total count for pagination
    const totalStudents = await Student.countDocuments(filter);
    const totalPages = Math.ceil(totalStudents / limit);

    // Get students with population
    const students = await Student.find(filter)
      .populate('class', 'className section classCode')
      .populate('department', 'departmentName departmentCode')
      .populate('courses', 'courseName courseCode creditHours')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Add virtual fields to each student
    const enhancedStudents = students.map(student => ({
      ...student,
      fullAddress: `${student.address.street}, ${student.address.city}, ${student.address.state} ${student.address.zipCode}`,
      age: calculateAge(student.dateOfBirth)
    }));

    res.status(200).json({
      success: true,
      count: enhancedStudents.length,
      total: totalStudents,
      pagination: {
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: enhancedStudents
    });
  } catch (error) {
    console.error('Error in getAllStudents:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Get single student by ID
 * @route   GET /api/students/:id
 * @access  Public
 */
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('class', 'className section classCode capacity currentStrength')
      .populate('department', 'departmentName departmentCode headOfDepartment totalStudents')
      .populate('courses', 'courseName courseCode creditHours semester year instructor')
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Add virtual fields
    student.fullAddress = `${student.address.street}, ${student.address.city}, ${student.address.state} ${student.address.zipCode}`;
    student.age = calculateAge(student.dateOfBirth);

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error in getStudentById:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Create new student
 * @route   POST /api/students
 * @access  Public
 */
exports.createStudent = async (req, res) => {
  try {
    // Check if roll number already exists
    const existingStudent = await Student.findOne({ 
      rollNumber: req.body.rollNumber 
    });
    
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        error: 'Roll number already exists'
      });
    }

    // Check if email already exists
    const existingEmail = await Student.findOne({ 
      email: req.body.email.toLowerCase() 
    });
    
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Check if class exists
    const classExists = await Class.findById(req.body.class);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check if class has available seats
    if (classExists.currentStrength >= classExists.capacity) {
      return res.status(400).json({
        success: false,
        error: 'Class is full. No more seats available'
      });
    }

    // Check if department exists
    const departmentExists = await Department.findById(req.body.department);
    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    // Check if courses exist
    if (req.body.courses && req.body.courses.length > 0) {
      const coursesExist = await Course.find({ 
        _id: { $in: req.body.courses } 
      });
      
      if (coursesExist.length !== req.body.courses.length) {
        return res.status(404).json({
          success: false,
          error: 'One or more courses not found'
        });
      }

      // Check if courses have available seats
      const fullCourses = coursesExist.filter(course => 
        course.enrolledStudents >= course.maxStudents
      );
      
      if (fullCourses.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Course(s) ${fullCourses.map(c => c.courseCode).join(', ')} are full`
        });
      }
    }

    // Create student
    const studentData = {
      ...req.body,
      email: req.body.email.toLowerCase(),
      rollNumber: req.body.rollNumber.toUpperCase()
    };

    const student = new Student(studentData);
    await student.save();

    // Update class current strength
    classExists.currentStrength += 1;
    await classExists.save();

    // Update department student count
    departmentExists.totalStudents += 1;
    await departmentExists.save();

    // Update course enrolled students count
    if (req.body.courses && req.body.courses.length > 0) {
      await Course.updateMany(
        { _id: { $in: req.body.courses } },
        { $inc: { enrolledStudents: 1 } }
      );
    }

    // Populate and return created student
    const populatedStudent = await Student.findById(student._id)
      .populate('class', 'className section classCode')
      .populate('department', 'departmentName departmentCode')
      .populate('courses', 'courseName courseCode creditHours');

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: populatedStudent
    });
  } catch (error) {
    console.error('Error in createStudent:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        messages: errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 * @access  Public
 */
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Check if updating email and if it already exists (excluding current student)
    if (req.body.email && req.body.email !== student.email) {
      const existingEmail = await Student.findOne({ 
        email: req.body.email.toLowerCase(),
        _id: { $ne: student._id }
      });
      
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
      req.body.email = req.body.email.toLowerCase();
    }

    // Check if updating roll number and if it already exists
    if (req.body.rollNumber && req.body.rollNumber !== student.rollNumber) {
      const existingRollNumber = await Student.findOne({ 
        rollNumber: req.body.rollNumber.toUpperCase(),
        _id: { $ne: student._id }
      });
      
      if (existingRollNumber) {
        return res.status(400).json({
          success: false,
          error: 'Roll number already exists'
        });
      }
      req.body.rollNumber = req.body.rollNumber.toUpperCase();
    }

    // Handle class change
    if (req.body.class && req.body.class !== student.class.toString()) {
      const oldClass = await Class.findById(student.class);
      const newClass = await Class.findById(req.body.class);
      
      if (!newClass) {
        return res.status(404).json({
          success: false,
          error: 'New class not found'
        });
      }

      if (newClass.currentStrength >= newClass.capacity) {
        return res.status(400).json({
          success: false,
          error: 'New class is full'
        });
      }

      // Update class counts
      if (oldClass) {
        oldClass.currentStrength -= 1;
        await oldClass.save();
      }
      
      newClass.currentStrength += 1;
      await newClass.save();
    }

    // Handle department change
    if (req.body.department && req.body.department !== student.department.toString()) {
      const oldDepartment = await Department.findById(student.department);
      const newDepartment = await Department.findById(req.body.department);
      
      if (!newDepartment) {
        return res.status(404).json({
          success: false,
          error: 'New department not found'
        });
      }

      // Update department counts
      if (oldDepartment) {
        oldDepartment.totalStudents -= 1;
        await oldDepartment.save();
      }
      
      newDepartment.totalStudents += 1;
      await newDepartment.save();
    }

    // Handle courses change
    if (req.body.courses) {
      const oldCourses = student.courses.map(c => c.toString());
      const newCourses = req.body.courses;
      
      // Find courses to remove
      const coursesToRemove = oldCourses.filter(courseId => 
        !newCourses.includes(courseId)
      );
      
      // Find courses to add
      const coursesToAdd = newCourses.filter(courseId => 
        !oldCourses.includes(courseId)
      );

      // Remove student from old courses
      if (coursesToRemove.length > 0) {
        await Course.updateMany(
          { _id: { $in: coursesToRemove } },
          { $inc: { enrolledStudents: -1 } }
        );
      }

      // Add student to new courses (check capacity first)
      if (coursesToAdd.length > 0) {
        const coursesToAddData = await Course.find({ _id: { $in: coursesToAdd } });
        
        const fullCourses = coursesToAddData.filter(course => 
          course.enrolledStudents >= course.maxStudents
        );
        
        if (fullCourses.length > 0) {
          return res.status(400).json({
            success: false,
            error: `Course(s) ${fullCourses.map(c => c.courseCode).join(', ')} are full`
          });
        }

        await Course.updateMany(
          { _id: { $in: coursesToAdd } },
          { $inc: { enrolledStudents: 1 } }
        );
      }
    }

    // Update student
    Object.keys(req.body).forEach(key => {
      student[key] = req.body[key];
    });

    student.updatedAt = Date.now();
    await student.save();

    // Populate and return updated student
    const populatedStudent = await Student.findById(student._id)
      .populate('class', 'className section classCode')
      .populate('department', 'departmentName departmentCode')
      .populate('courses', 'courseName courseCode creditHours');

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: populatedStudent
    });
  } catch (error) {
    console.error('Error in updateStudent:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        messages: errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 * @access  Public
 */
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Update class current strength
    const classData = await Class.findById(student.class);
    if (classData) {
      classData.currentStrength -= 1;
      await classData.save();
    }

    // Update department student count
    const departmentData = await Department.findById(student.department);
    if (departmentData) {
      departmentData.totalStudents -= 1;
      await departmentData.save();
    }

    // Update course enrolled students count
    if (student.courses && student.courses.length > 0) {
      await Course.updateMany(
        { _id: { $in: student.courses } },
        { $inc: { enrolledStudents: -1 } }
      );
    }

    // Delete student
    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: {
        id: req.params.id,
        name: student.name,
        rollNumber: student.rollNumber
      }
    });
  } catch (error) {
    console.error('Error in deleteStudent:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Search students with advanced filtering
 * @route   GET /api/students/search
 * @access  Public
 */
exports.searchStudents = async (req, res) => {
  try {
    const {
      q, // General search query
      name,
      rollNumber,
      email,
      phone,
      class: classId,
      department,
      status,
      gender,
      academicYear,
      city,
      state,
      minAge,
      maxAge,
      enrollmentDateFrom,
      enrollmentDateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // General search across multiple fields
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { rollNumber: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { 'guardianInfo.name': { $regex: q, $options: 'i' } },
        { 'address.city': { $regex: q, $options: 'i' } }
      ];
    }

    // Specific field filters
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (rollNumber) filter.rollNumber = { $regex: rollNumber, $options: 'i' };
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (phone) filter.phone = { $regex: phone, $options: 'i' };
    if (classId) filter.class = classId;
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (gender) filter.gender = gender;
    if (academicYear) filter.academicYear = academicYear;
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (state) filter['address.state'] = { $regex: state, $options: 'i' };

    // Date range filters
    if (enrollmentDateFrom || enrollmentDateTo) {
      filter.enrollmentDate = {};
      if (enrollmentDateFrom) {
        filter.enrollmentDate.$gte = new Date(enrollmentDateFrom);
      }
      if (enrollmentDateTo) {
        filter.enrollmentDate.$lte = new Date(enrollmentDateTo);
      }
    }

    // Age range filter (calculated from date of birth)
    if (minAge || maxAge) {
      const today = new Date();
      const maxDate = minAge ? 
        new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate()) : 
        new Date('1900-01-01');
      
      const minDate = maxAge ? 
        new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate()) : 
        new Date();
      
      filter.dateOfBirth = {};
      if (minAge) filter.dateOfBirth.$lte = maxDate;
      if (maxAge) filter.dateOfBirth.$gte = minDate;
    }

    // Get total count
    const totalStudents = await Student.countDocuments(filter);
    const totalPages = Math.ceil(totalStudents / limit);

    // Execute query
    const students = await Student.find(filter)
      .populate('class', 'className section classCode')
      .populate('department', 'departmentName departmentCode')
      .populate('courses', 'courseName courseCode creditHours')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Add virtual fields
    const enhancedStudents = students.map(student => ({
      ...student,
      fullAddress: `${student.address.street}, ${student.address.city}, ${student.address.state} ${student.address.zipCode}`,
      age: calculateAge(student.dateOfBirth)
    }));

    // Aggregations for statistics
    const stats = await Student.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          activeStudents: { 
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } 
          },
          averageAge: { $avg: { $subtract: [new Date(), '$dateOfBirth'] } }
        }
      },
      {
        $project: {
          totalStudents: 1,
          activeStudents: 1,
          averageAge: { $divide: ['$averageAge', 365 * 24 * 60 * 60 * 1000] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: enhancedStudents.length,
      total: totalStudents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      statistics: stats[0] || {
        totalStudents: 0,
        activeStudents: 0,
        averageAge: 0
      },
      data: enhancedStudents
    });
  } catch (error) {
    console.error('Error in searchStudents:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Get student statistics
 * @route   GET /api/students/stats
 * @access  Public
 */
exports.getStudentStats = async (req, res) => {
  try {
    const stats = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          activeStudents: { 
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } 
          },
          inactiveStudents: { 
            $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] } 
          },
          graduatedStudents: { 
            $sum: { $cond: [{ $eq: ['$status', 'Graduated'] }, 1, 0] } 
          },
          suspendedStudents: { 
            $sum: { $cond: [{ $eq: ['$status', 'Suspended'] }, 1, 0] } 
          },
          maleStudents: { 
            $sum: { $cond: [{ $eq: ['$gender', 'Male'] }, 1, 0] } 
          },
          femaleStudents: { 
            $sum: { $cond: [{ $eq: ['$gender', 'Female'] }, 1, 0] } 
          },
          otherStudents: { 
            $sum: { $cond: [{ $eq: ['$gender', 'Other'] }, 1, 0] } 
          }
        }
      },
      {
        $lookup: {
          from: 'classes',
          localField: '_id',
          foreignField: '_id',
          as: 'classStats'
        }
      },
      {
        $project: {
          totalStudents: 1,
          statusDistribution: {
            active: '$activeStudents',
            inactive: '$inactiveStudents',
            graduated: '$graduatedStudents',
            suspended: '$suspendedStudents'
          },
          genderDistribution: {
            male: '$maleStudents',
            female: '$femaleStudents',
            other: '$otherStudents'
          }
        }
      }
    ]);

    // Department-wise statistics
    const departmentStats = await Student.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'departmentInfo'
        }
      },
      {
        $unwind: '$departmentInfo'
      },
      {
        $project: {
          departmentName: '$departmentInfo.departmentName',
          departmentCode: '$departmentInfo.departmentCode',
          studentCount: '$count'
        }
      },
      { $sort: { studentCount: -1 } }
    ]);

    // Class-wise statistics
    const classStats = await Student.aggregate([
      {
        $group: {
          _id: '$class',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'classes',
          localField: '_id',
          foreignField: '_id',
          as: 'classInfo'
        }
      },
      {
        $unwind: '$classInfo'
      },
      {
        $project: {
          className: '$classInfo.className',
          section: '$classInfo.section',
          studentCount: '$count',
          capacity: '$classInfo.capacity',
          percentageFull: {
            $multiply: [
              { $divide: ['$count', '$classInfo.capacity'] },
              100
            ]
          }
        }
      },
      { $sort: { studentCount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalStudents: 0,
          statusDistribution: {
            active: 0,
            inactive: 0,
            graduated: 0,
            suspended: 0
          },
          genderDistribution: {
            male: 0,
            female: 0,
            other: 0
          }
        },
        departmentStats,
        classStats
      }
    });
  } catch (error) {
    console.error('Error in getStudentStats:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Bulk create students
 * @route   POST /api/students/bulk
 * @access  Public
 */
exports.bulkCreateStudents = async (req, res) => {
  try {
    const { students } = req.body;
    
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Students array is required'
      });
    }

    // Limit bulk operations
    if (students.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Cannot process more than 100 students at once'
      });
    }

    const results = {
      success: [],
      errors: []
    };

    // Process each student
    for (const studentData of students) {
      try {
        // Validate required fields
        if (!studentData.name || !studentData.rollNumber || !studentData.email) {
          results.errors.push({
            student: studentData,
            error: 'Missing required fields'
          });
          continue;
        }

        // Check duplicates
        const existingStudent = await Student.findOne({
          $or: [
            { rollNumber: studentData.rollNumber },
            { email: studentData.email }
          ]
        });

        if (existingStudent) {
          results.errors.push({
            student: studentData,
            error: 'Duplicate roll number or email'
          });
          continue;
        }

        // Create student
        const student = new Student({
          ...studentData,
          email: studentData.email.toLowerCase(),
          rollNumber: studentData.rollNumber.toUpperCase()
        });

        await student.save();
        results.success.push({
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber
        });

      } catch (error) {
        results.errors.push({
          student: studentData,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Processed ${students.length} students`,
      results: {
        successful: results.success.length,
        failed: results.errors.length,
        details: {
          success: results.success,
          errors: results.errors
        }
      }
    });
  } catch (error) {
    console.error('Error in bulkCreateStudents:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Export students data
 * @route   GET /api/students/export
 * @access  Public
 */
exports.exportStudents = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const students = await Student.find()
      .populate('class', 'className section')
      .populate('department', 'departmentName departmentCode')
      .populate('courses', 'courseName courseCode')
      .lean();

    if (format === 'csv') {
      // Convert to CSV
      const csvData = convertToCSV(students);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
      return res.send(csvData);
    }

    // Default JSON format
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Error in exportStudents:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// Helper function to calculate age
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Helper function to convert to CSV
function convertToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) {
        return '';
      }
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}