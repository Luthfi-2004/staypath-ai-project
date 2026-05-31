const express = require('express');
const router = express.Router();
const { 
  getAllLeaves, 
  getMyLeaves, 
  submitLeaveRequest, 
  updateLeaveStatus 
} = require('../controllers/leaveController');

router.get('/', getAllLeaves); // HRD
router.get('/:employee_id', getMyLeaves); // Karyawan
router.post('/', submitLeaveRequest); // Karyawan
router.put('/:id/status', updateLeaveStatus); // HRD

module.exports = router;
