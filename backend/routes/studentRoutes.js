const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { studentValidators, validate } = require('../utils/validators');

// Student routes
router.route('/')
  .get(studentController.getAllStudents)
  .post(
    validate(studentValidators.createStudent),
    studentController.createStudent
  );

router.route('/search')
  .get(
    validate(studentValidators.searchStudents),
    studentController.searchStudents
  );

router.route('/stats')
  .get(studentController.getStudentStats);

router.route('/bulk')
  .post(studentController.bulkCreateStudents);

router.route('/export')
  .get(studentController.exportStudents);

router.route('/:id')
  .get(
    validate(studentValidators.getStudentById),
    studentController.getStudentById
  )
  .put(
    validate(studentValidators.updateStudent),
    studentController.updateStudent
  )
  .delete(
    validate(studentValidators.deleteStudent),
    studentController.deleteStudent
  );

module.exports = router;