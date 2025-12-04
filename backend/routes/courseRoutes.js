const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { courseValidators, validate } = require('../utils/validators');

// Course routes
router.route('/')
  .get(courseController.getAllCourses)
  .post(
    validate(courseValidators.createCourse),
    courseController.createCourse
  );

router.route('/stats')
  .get(courseController.getCourseStats);

router.route('/:id/enroll')
  .post(courseController.enrollStudent);

router.route('/:id/withdraw')
  .post(courseController.withdrawStudent);

router.route('/:id')
  .get(courseController.getCourseById)
  .put(courseController.updateCourse)
  .delete(courseController.deleteCourse);

module.exports = router;