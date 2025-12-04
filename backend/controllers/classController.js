const Class = require('../models/Class');
const Department = require('../models/Department');
const Student = require('../models/Student');

/**
 * @desc    Get all classes
 * @route   GET /api/classes
 * @access  Public
 */
exports.getAllClasses = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, department } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;

    const totalClasses = await Class.countDocuments(filter);
    const totalPages = Math.ceil(totalClasses / limit);

    const classes = await Class.find(filter)
      .populate('department', 'departmentName departmentCode')
      .sort({ className: 1, section: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Add virtual fields
    const enhancedClasses = classes.map(cls => ({
      ...cls,
      classCode: `${cls.className}-${cls.section}`,
      availableSeats: cls.capacity - cls.currentStrength,
      isFull: cls.currentStrength >= cls.capacity
    }));

    res.status(200).json({
      success: true,
      count: enhancedClasses.length,
      total: totalClasses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: enhancedClasses
    });
  } catch (error) {
    console.error('Error in getAllClasses:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Get class by ID
 * @route   GET /api/classes/:id
 * @access  Public
 */
exports.getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('department', 'departmentName departmentCode headOfDepartment')
      .lean();

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Get students in this class
    const students = await Student.find({ class: req.params.id })
      .select('name rollNumber email phone status')
      .lean();

    // Add virtual fields
    classData.classCode = `${classData.className}-${classData.section}`;
    classData.availableSeats = classData.capacity - classData.currentStrength;
    classData.isFull = classData.currentStrength >= classData.capacity;

    res.status(200).json({
      success: true,
      data: {
        ...classData,
        students: {
          count: students.length,
          list: students
        }
      }
    });
  } catch (error) {
    console.error('Error in getClassById:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Create new class
 * @route   POST /api/classes
 * @access  Public
 */
exports.createClass = async (req, res) => {
  try {
    // Check if class with same name and section already exists
    const existingClass = await Class.findOne({
      className: req.body.className.toUpperCase(),
      section: req.body.section.toUpperCase(),
      academicYear: req.body.academicYear
    });

    if (existingClass) {
      return res.status(400).json({
        success: false,
        error: 'Class with this name, section and academic year already exists'
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

    // Create class
    const classData = {
      ...req.body,
      className: req.body.className.toUpperCase(),
      section: req.body.section.toUpperCase()
    };

    const newClass = new Class(classData);
    await newClass.save();

    // Populate and return
    const populatedClass = await Class.findById(newClass._id)
      .populate('department', 'departmentName departmentCode');

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: populatedClass
    });
  } catch (error) {
    console.error('Error in createClass:', error);
    
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
 * @desc    Update class
 * @route   PUT /api/classes/:id
 * @access  Public
 */
exports.updateClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check if updating to a duplicate class
    if (req.body.className || req.body.section || req.body.academicYear) {
      const className = (req.body.className || classData.className).toUpperCase();
      const section = (req.body.section || classData.section).toUpperCase();
      const academicYear = req.body.academicYear || classData.academicYear;

      const duplicateClass = await Class.findOne({
        className,
        section,
        academicYear,
        _id: { $ne: classData._id }
      });

      if (duplicateClass) {
        return res.status(400).json({
          success: false,
          error: 'Class with this name, section and academic year already exists'
        });
      }

      if (req.body.className) req.body.className = className;
      if (req.body.section) req.body.section = section;
    }

    // Check if updating capacity to less than current strength
    if (req.body.capacity && req.body.capacity < classData.currentStrength) {
      return res.status(400).json({
        success: false,
        error: `Capacity cannot be less than current strength (${classData.currentStrength})`
      });
    }

    // Update class
    Object.keys(req.body).forEach(key => {
      classData[key] = req.body[key];
    });

    await classData.save();

    // Populate and return
    const populatedClass = await Class.findById(classData._id)
      .populate('department', 'departmentName departmentCode');

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: populatedClass
    });
  } catch (error) {
    console.error('Error in updateClass:', error);
    
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
 * @desc    Delete class
 * @route   DELETE /api/classes/:id
 * @access  Public
 */
exports.deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check if class has students
    const studentCount = await Student.countDocuments({ class: req.params.id });
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete class with ${studentCount} students. Remove students first.`
      });
    }

    // Delete class
    await Class.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully',
      data: {
        id: req.params.id,
        className: classData.className,
        section: classData.section
      }
    });
  } catch (error) {
    console.error('Error in deleteClass:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

/**
 * @desc    Get class statistics
 * @route   GET /api/classes/stats
 * @access  Public
 */
exports.getClassStats = async (req, res) => {
  try {
    const stats = await Class.aggregate([
      {
        $group: {
          _id: null,
          totalClasses: { $sum: 1 },
          activeClasses: { 
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } 
          },
          totalCapacity: { $sum: '$capacity' },
          totalStudents: { $sum: '$currentStrength' },
          averageClassSize: { $avg: '$currentStrength' },
          maxClassSize: { $max: '$currentStrength' },
          minClassSize: { $min: '$currentStrength' }
        }
      },
      {
        $project: {
          totalClasses: 1,
          activeClasses: 1,
          totalCapacity: 1,
          totalStudents: 1,
          availableSeats: { $subtract: ['$totalCapacity', '$totalStudents'] },
          averageClassSize: { $round: ['$averageClassSize', 2] },
          maxClassSize: 1,
          minClassSize: 1,
          overallUtilization: {
            $multiply: [
              { $divide: ['$totalStudents', '$totalCapacity'] },
              100
            ]
          }
        }
      }
    ]);

    // Department-wise class statistics
    const departmentClassStats = await Class.aggregate([
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
          classCount: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
          totalStudents: { $sum: '$currentStrength' }
        }
      },
      {
        $project: {
          departmentName: 1,
          departmentCode: 1,
          classCount: 1,
          totalCapacity: 1,
          totalStudents: 1,
          availableSeats: { $subtract: ['$totalCapacity', '$totalStudents'] },
          utilizationRate: {
            $multiply: [
              { $divide: ['$totalStudents', '$totalCapacity'] },
              100
            ]
          }
        }
      },
      { $sort: { classCount: -1 } }
    ]);

    // Status distribution
    const statusDistribution = await Class.aggregate([
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
          totalClasses: 0,
          activeClasses: 0,
          totalCapacity: 0,
          totalStudents: 0,
          availableSeats: 0,
          averageClassSize: 0,
          maxClassSize: 0,
          minClassSize: 0,
          overallUtilization: 0
        },
        departmentWise: departmentClassStats,
        statusDistribution
      }
    });
  } catch (error) {
    console.error('Error in getClassStats:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};