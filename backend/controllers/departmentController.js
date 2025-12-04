const Department = require('../models/Department');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Course = require('../models/Course');

/**
 * @desc    Get all departments
 * @route   GET /api/departments
 * @access  Public
 */
exports.getAllDepartments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (status) filter.status = status;

    const totalDepartments = await Department.countDocuments(filter);
    const totalPages = Math.ceil(totalDepartments / limit);

    const departments = await Department.find(filter)
      .sort({ departmentName: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Add virtual age field
    const enhancedDepartments = departments.map(dept => ({
      ...dept,
      age: new Date().getFullYear() - dept.establishmentYear
    }));

    res.status(200).json({
      success: true,
      count: enhancedDepartments.length,
      total: totalDepartments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: enhancedDepartments
    });
  } catch (error) {
    console.error('Error in getAllDepartments:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Get department by ID
 * @route   GET /api/departments/:id
 * @access  Public
 */
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).lean();

    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    // Get related data
    const [classes, students, courses] = await Promise.all([
      Class.find({ department: req.params.id })
        .select('className section academicYear currentStrength capacity status')
        .lean(),
      Student.find({ department: req.params.id })
        .select('name rollNumber email class status')
        .populate('class', 'className section')
        .lean(),
      Course.find({ department: req.params.id })
        .select('courseName courseCode creditHours semester year enrolledStudents')
        .lean()
    ]);

    // Add virtual fields
    department.age = new Date().getFullYear() - department.establishmentYear;

    res.status(200).json({
      success: true,
      data: {
        ...department,
        statistics: {
          classes: {
            count: classes.length,
            list: classes
          },
          students: {
            count: students.length,
            list: students.slice(0, 10) // Show only first 10
          },
          courses: {
            count: courses.length,
            list: courses
          }
        }
      }
    });
  } catch (error) {
    console.error('Error in getDepartmentById:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Create new department
 * @route   POST /api/departments
 * @access  Public
 */
exports.createDepartment = async (req, res) => {
  try {
    // Check if department with same name or code already exists
    const existingDepartment = await Department.findOne({
      $or: [
        { departmentName: req.body.departmentName },
        { departmentCode: req.body.departmentCode.toUpperCase() }
      ]
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        error: 'Department with this name or code already exists'
      });
    }

    // Create department
    const departmentData = {
      ...req.body,
      departmentCode: req.body.departmentCode.toUpperCase()
    };

    const newDepartment = new Department(departmentData);
    await newDepartment.save();

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: newDepartment
    });
  } catch (error) {
    console.error('Error in createDepartment:', error);
    
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
 * @desc    Update department
 * @route   PUT /api/departments/:id
 * @access  Public
 */
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    // Check if updating to duplicate name or code
    if (req.body.departmentName || req.body.departmentCode) {
      const departmentName = req.body.departmentName || department.departmentName;
      const departmentCode = (req.body.departmentCode || department.departmentCode).toUpperCase();

      const duplicateDepartment = await Department.findOne({
        $or: [
          { departmentName },
          { departmentCode }
        ],
        _id: { $ne: department._id }
      });

      if (duplicateDepartment) {
        return res.status(400).json({
          success: false,
          error: 'Department with this name or code already exists'
        });
      }

      if (req.body.departmentCode) {
        req.body.departmentCode = departmentCode;
      }
    }

    // Update department
    Object.keys(req.body).forEach(key => {
      department[key] = req.body[key];
    });

    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    console.error('Error in updateDepartment:', error);
    
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
 * @desc    Delete department
 * @route   DELETE /api/departments/:id
 * @access  Public
 */
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    // Check if department has related data
    const [classCount, studentCount, courseCount] = await Promise.all([
      Class.countDocuments({ department: req.params.id }),
      Student.countDocuments({ department: req.params.id }),
      Course.countDocuments({ department: req.params.id })
    ]);

    if (classCount > 0 || studentCount > 0 || courseCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete department. It has ${classCount} classes, ${studentCount} students, and ${courseCount} courses.`
      });
    }

    // Delete department
    await Department.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
      data: {
        id: req.params.id,
        departmentName: department.departmentName,
        departmentCode: department.departmentCode
      }
    });
  } catch (error) {
    console.error('Error in deleteDepartment:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Get department statistics
 * @route   GET /api/departments/stats
 * @access  Public
 */
exports.getDepartmentStats = async (req, res) => {
  try {
    const stats = await Department.aggregate([
      {
        $group: {
          _id: null,
          totalDepartments: { $sum: 1 },
          activeDepartments: { 
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } 
          },
          totalFaculty: { $sum: '$totalFaculty' },
          totalStudents: { $sum: '$totalStudents' },
          oldestDepartment: { $min: '$establishmentYear' },
          newestDepartment: { $max: '$establishmentYear' },
          averageFaculty: { $avg: '$totalFaculty' },
          averageStudents: { $avg: '$totalStudents' }
        }
      },
      {
        $project: {
          totalDepartments: 1,
          activeDepartments: 1,
          inactiveDepartments: { $subtract: ['$totalDepartments', '$activeDepartments'] },
          totalFaculty: 1,
          totalStudents: 1,
          oldestDepartment: 1,
          newestDepartment: 1,
          averageFaculty: { $round: ['$averageFaculty', 2] },
          averageStudents: { $round: ['$averageStudents', 2] },
          studentToFacultyRatio: {
            $cond: [
              { $eq: ['$totalFaculty', 0] },
              0,
              { $divide: ['$totalStudents', '$totalFaculty'] }
            ]
          }
        }
      }
    ]);

    // Detailed department statistics
    const detailedStats = await Department.aggregate([
      {
        $lookup: {
          from: 'classes',
          localField: '_id',
          foreignField: 'department',
          as: 'classes'
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'department',
          as: 'courses'
        }
      },
      {
        $project: {
          departmentName: 1,
          departmentCode: 1,
          establishmentYear: 1,
          status: 1,
          totalFaculty: 1,
          totalStudents: 1,
          classCount: { $size: '$classes' },
          courseCount: { $size: '$courses' },
          age: { $subtract: [new Date().getFullYear(), '$establishmentYear'] }
        }
      },
      { $sort: { totalStudents: -1 } }
    ]);

    // Status distribution
    const statusDistribution = await Department.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalDepartments: 0,
          activeDepartments: 0,
          inactiveDepartments: 0,
          totalFaculty: 0,
          totalStudents: 0,
          oldestDepartment: 0,
          newestDepartment: 0,
          averageFaculty: 0,
          averageStudents: 0,
          studentToFacultyRatio: 0
        },
        detailedStats,
        statusDistribution
      }
    });
  } catch (error) {
    console.error('Error in getDepartmentStats:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};