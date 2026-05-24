const express = require('express');
const router = express.Router();
const { 
  getEmployees, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee 
} = require('../controllers/employeeController');

// Daftar endpoint API karyawan
router.get('/', getEmployees);       // GET http://localhost:5001/api/employees
router.post('/', addEmployee);     // POST http://localhost:5001/api/employees
router.put('/:id', updateEmployee);  // PUT http://localhost:5001/api/employees/ID_KARYAWAN
router.delete('/:id', deleteEmployee); // DELETE http://localhost:5001/api/employees/ID_KARYAWAN

module.exports = router;