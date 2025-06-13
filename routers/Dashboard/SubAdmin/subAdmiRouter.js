const express = require('express');
const router = express.Router();
const { createSubAdmin, getAllSubAdmins, getSubAdminById, updateSubAdmin, deleteSubAdmin } = require('../../../controllers/Dashboard/SubAdmin/subAdminController');
const authMiddleware = require('../../../middleware/authToken');

// Create a new sub-admin
router.post('/addSubAdmin',  createSubAdmin);
router.get('/getSubAdmins', getAllSubAdmins);
// router.get('/:id', getSubAdminById);
router.put('/updateSubAdmin/:id',  updateSubAdmin);
router.delete('/deleteSubAdmin/:id',  deleteSubAdmin);

module.exports = router;