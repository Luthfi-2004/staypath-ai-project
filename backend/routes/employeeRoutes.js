const express = require('express');
const router = express.Router();
const { 
  getEmployees, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee,
  updateEmployeeStatus,
  updateEmployeeTeam,
  updateAIProfile
} = require('../controllers/employeeController');

// Daftar endpoint API karyawan
router.get('/', getEmployees);       
router.post('/', addEmployee);     
router.put('/:id', updateEmployee);  

// 🌟 ENDPOINT JALUR KHUSUS 🌟
router.patch('/:id/status', updateEmployeeStatus); 
router.patch('/:id/team', updateEmployeeTeam); 
router.put('/:id/ai-profile', updateAIProfile);

router.delete('/:id', deleteEmployee); 

module.exports = router;