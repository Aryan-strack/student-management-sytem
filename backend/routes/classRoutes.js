const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { classValidators, validate } = require('../utils/validators');

// Class routes
router.route('/')
  .get(classController.getAllClasses)
  .post(
    validate(classValidators.createClass),
    classController.createClass
  );

router.route('/stats')
  .get(classController.getClassStats);

router.route('/:id')
  .get(classController.getClassById)
  .put(classController.updateClass)
  .delete(classController.deleteClass);

module.exports = router;