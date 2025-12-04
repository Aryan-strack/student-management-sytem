const Course = require('../models/Course');
const Department = require('../models/Department');
const Student = require('../models/Student');

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Public
 */
exports.getAllCourses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      department, 
      semester, 
      year, 
      courseType, 
      status 
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    if (year) filter.year = parseInt(year);
    if (courseType) filter.courseType = courseType;
    if (status) filter.status = status;

    const totalCourses = await Course.countDocuments(filter);
    const totalPages = Math.ceil(totalCourses / limit);

    const courses = await Course.find(filter)
      .populate('department', 'departmentName departmentCode')
      .populate('prerequisites', 'courseName courseCode')
      .sort({ courseCode: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Add virtual fields
    const enhancedCourses = courses.map(course => ({
      ...course,
      availableSeats: course.maxStudents - course.enrolledStudents,
      isFull: course.enrolledStudents >= course.maxStudents,
      enrollmentRate: course.maxStudents > 0 ? 
        (course.enrolledStudents / course.maxStudents) * 100 : 0
    }));

    res.status(200).json({
      success: true,
      count: enhancedCourses.length,
      total: totalCourses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: enhancedCourses
    });
  } catch (error) {
    console.error('Error in getAllCourses:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Get course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('department', 'departmentName departmentCode headOfDepartment')
      .populate('prerequisites', 'courseName courseCode creditHours')
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Get students enrolled in this course
    const students = await Student.find({ courses: req.params.id })
      .select('name rollNumber email class department')
      .populate('class', 'className section')
      .populate('department', 'departmentName')
      .lean();

    // Add virtual fields
    course.availableSeats = course.maxStudents - course.enrolledStudents;
    course.isFull = course.enrolledStudents >= course.maxStudents;
    course.enrollmentRate = course.maxStudents > 0 ? 
      (course.enrolledStudents / course.maxStudents) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        ...course,
        enrolledStudents: {
          count: students.length,
          list: students
        }
      }
    });
  } catch (error) {
    console.error('Error in getCourseById:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Create new course
 * @route   POST /api/courses
 * @access  Public
 */
exports.createCourse = async (req, res) => {
  try {
    // Check if course with same code already exists
    const existingCourse = await Course.findOne({
      courseCode: req.body.courseCode.toUpperCase()
    });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        error: 'Course with this code already exists'
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

    // Validate prerequisites
    if (req.body.prerequisites && req.body.prerequisites.length > 0) {
      const prerequisitesExist = await Course.find({ 
        _id: { $in: req.body.prerequisites } 
      });
      
      if (prerequisitesExist.length !== req.body.prerequisites.length) {
        return res.status(404).json({
          success: false,
          error: 'One or more prerequisites not found'
        });
      }
    }

    // Create course
    const courseData = {
      ...req.body,
      courseCode: req.body.courseCode.toUpperCase()
    };

    const newCourse = new Course(courseData);
    await newCourse.save();

    // Populate and return
    const populatedCourse = await Course.findById(newCourse._id)
      .populate('department', 'departmentName departmentCode')
      .populate('prerequisites', 'courseName courseCode');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: populatedCourse
    });
  } catch (error) {
    console.error('Error in createCourse:', error);
    
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
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Public
 */
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if updating to duplicate course code
    if (req.body.courseCode && req.body.courseCode !== course.courseCode) {
      const duplicateCourse = await Course.findOne({
        courseCode: req.body.courseCode.toUpperCase(),
        _id: { $ne: course._id }
      });

      if (duplicateCourse) {
        return res.status(400).json({
          success: false,
          error: 'Course with this code already exists'
        });
      }
      req.body.courseCode = req.body.courseCode.toUpperCase();
    }

    // Check if updating max students to less than enrolled students
    if (req.body.maxStudents && req.body.maxStudents < course.enrolledStudents) {
      return res.status(400).json({
        success: false,
        error: `Maximum students cannot be less than currently enrolled (${course.enrolledStudents})`
      });
    }

    // Validate prerequisites
    if (req.body.prerequisites) {
      const prerequisitesExist = await Course.find({ 
        _id: { $in: req.body.prerequisites } 
      });
      
      if (prerequisitesExist.length !== req.body.prerequisites.length) {
        return res.status(404).json({
          success: false,
          error: 'One or more prerequisites not found'
        });
      }

      // Check for circular dependencies
      if (req.body.prerequisites.includes(course._id.toString())) {
        return res.status(400).json({
          success: false,
          error: 'Course cannot be a prerequisite of itself'
        });
      }
    }

    // Update course
    Object.keys(req.body).forEach(key => {
      course[key] = req.body[key];
    });

    await course.save();

    // Populate and return
    const populatedCourse = await Course.findById(course._id)
      .populate('department', 'departmentName departmentCode')
      .populate('prerequisites', 'courseName courseCode');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: populatedCourse
    });
  } catch (error) {
    console.error('Error in updateCourse:', error);
    
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
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Public
 */
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if course has enrolled students
    const studentCount = await Student.countDocuments({ courses: req.params.id });
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete course with ${studentCount} enrolled students. Remove students first.`
      });
    }

    // Check if course is a prerequisite for other courses
    const dependentCourses = await Course.find({ prerequisites: req.params.id });
    if (dependentCourses.length > 0) {
      const courseNames = dependentCourses.map(c => c.courseName).join(', ');
      return res.status(400).json({
        success: false,
        error: `Course is a prerequisite for: ${courseNames}. Update those courses first.`
      });
    }

    // Delete course
    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
      data: {
        id: req.params.id,
        courseName: course.courseName,
        courseCode: course.courseCode
      }
    });
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Enroll student in course
 * @route   POST /api/courses/:id/enroll
 * @access  Public
 */
exports.enrollStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if course is full
    if (course.enrolledStudents >= course.maxStudents) {
      return res.status(400).json({
        success: false,
        error: 'Course is full'
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Check if student is already enrolled
    if (student.courses.includes(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Student is already enrolled in this course'
      });
    }

    // Check prerequisites
    if (course.prerequisites && course.prerequisites.length > 0) {
      const completedPrerequisites = course.prerequisites.every(prereqId =>
        student.courses.includes(prereqId)
      );

      if (!completedPrerequisites) {
        return res.status(400).json({
          success: false,
          error: 'Student does not meet course prerequisites'
        });
      }
    }

    // Enroll student
    student.courses.push(req.params.id);
    await student.save();

    // Update course enrollment count
    course.enrolledStudents += 1;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Student enrolled successfully',
      data: {
        student: {
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber
        },
        course: {
          id: course._id,
          courseName: course.courseName,
          courseCode: course.courseCode
        },
        enrollmentDate: new Date()
      }
    });
  } catch (error) {
    console.error('Error in enrollStudent:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Remove student from course
 * @route   POST /api/courses/:id/withdraw
 * @access  Public
 */
exports.withdrawStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Check if student is enrolled
    if (!student.courses.includes(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Student is not enrolled in this course'
      });
    }

    // Withdraw student
    student.courses = student.courses.filter(courseId => 
      courseId.toString() !== req.params.id
    );
    await student.save();

    // Update course enrollment count
    course.enrolledStudents = Math.max(0, course.enrolledStudents - 1);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Student withdrawn successfully',
      data: {
        student: {
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber
        },
        course: {
          id: course._id,
          courseName: course.courseName,
          courseCode: course.courseCode
        },
        withdrawalDate: new Date()
      }
    });
  } catch (error) {
    console.error('Error in withdrawStudent:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Get course statistics
 * @route   GET /api/courses/stats
 * @access  Public
 */
exports.getCourseStats = async (req, res) => {
  try {
    const stats = await Course.aggregate([
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          activeCourses: { 
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } 
          },
          totalCapacity: { $sum: '$maxStudents' },
          totalEnrolled: { $sum: '$enrolledStudents' },
          averageCreditHours: { $avg: '$creditHours' },
          maxCreditHours: { $max: '$creditHours' },
          minCreditHours: { $min: '$creditHours' }
        }
      },
      {
        $project: {
          totalCourses: 1,
          activeCourses: 1,
          totalCapacity: 1,
          totalEnrolled: 1,
          availableSeats: { $subtract: ['$totalCapacity', '$totalEnrolled'] },
          enrollmentRate: {
            $multiply: [
              { $cond: [
                { $eq: ['$totalCapacity', 0] },
                0,
                { $divide: ['$totalEnrolled', '$totalCapacity'] }
              ]},
              100
            ]
          },
          averageCreditHours: { $round: ['$averageCreditHours', 2] },
          maxCreditHours: 1,
          minCreditHours: 1
        }
      }
    ]);

    // Department-wise course statistics
    const departmentCourseStats = await Course.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'departmentInfo'
        }
      },
      { $unwind: '$departmentInfo' },
      {
        $group: {
          _id: '$department',
          departmentName: { $first: '$departmentInfo.departmentName' },
          departmentCode: { $first: '$departmentInfo.departmentCode' },
          courseCount: { $sum: 1 },
          totalCapacity: { $sum: '$maxStudents' },
          totalEnrolled: { $sum: '$enrolledStudents' },
          averageCreditHours: { $avg: '$creditHours' }
        }
      },
      {
        $project: {
          departmentName: 1,
          departmentCode: 1,
          courseCount: 1,
          totalCapacity: 1,
          totalEnrolled: 1,
          availableSeats: { $subtract: ['$totalCapacity', '$totalEnrolled'] },
          enrollmentRate: {
            $multiply: [
              { $cond: [
                { $eq: ['$totalCapacity', 0] },
                0,
                { $divide: ['$totalEnrolled', '$totalCapacity'] }
              ]},
              100
            ]
          },
          averageCreditHours: { $round: ['$averageCreditHours', 2] }
        }
      },
      { $sort: { courseCount: -1 } }
    ]);

    // Course type distribution
    const typeDistribution = await Course.aggregate([
      {
        $group: {
          _id: '$courseType',
          count: { $sum: 1 },
          totalEnrolled: { $sum: '$enrolledStudents' }
        }
      }
    ]);

    // Semester-wise statistics
    const semesterStats = await Course.aggregate([
      {
        $group: {
          _id: '$semester',
          count: { $sum: 1 },
          totalEnrolled: { $sum: '$enrolledStudents' },
          averageCreditHours: { $avg: '$creditHours' }
        }
      },
      {
        $project: {
          semester: '$_id',
          count: 1,
          totalEnrolled: 1,
          averageCreditHours: { $round: ['$averageCreditHours', 2] }
        }
      },
      { $sort: { semester: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalCourses: 0,
          activeCourses: 0,
          totalCapacity: 0,
          totalEnrolled: 0,
          availableSeats: 0,
          enrollmentRate: 0,
          averageCreditHours: 0,
          maxCreditHours: 0,
          minCreditHours: 0
        },
        departmentWise: departmentCourseStats,
        typeDistribution,
        semesterStats
      }
    });
  } catch (error) {
    console.error('Error in getCourseStats:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};