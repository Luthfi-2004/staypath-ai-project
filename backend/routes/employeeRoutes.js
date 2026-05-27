const express = require('express');
const router = express.Router();
const { 
  getEmployees, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee,
  updateEmployeeStatus // <-- Import fungsi barunya
} = require('../controllers/employeeController');

// Daftar endpoint API karyawan
router.get('/', getEmployees);       
router.post('/', addEmployee);     
router.put('/:id', updateEmployee);  

// 🌟 ENDPOINT JALUR KHUSUS 🌟
router.patch('/:id/status', updateEmployeeStatus); 

router.delete('/:id', deleteEmployee); 

module.exports = router;