const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { departmentValidators, validate } = require('../utils/validators');

// Department routes
router.route('/')
  .get(departmentController.getAllDepartments)
  .post(
    validate(departmentValidators.createDepartment),
    departmentController.createDepartment
  );

router.route('/stats')
  .get(departmentController.getDepartmentStats);

router.route('/:id')
  .get(departmentController.getDepartmentById)
  .put(departmentController.updateDepartment)
  .delete(departmentController.deleteDepartment);

module.exports = router;