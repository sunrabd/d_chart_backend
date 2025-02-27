// checkload_routes.js
const express = require('express');

const { authenticateToken } = require('../middleware/auth_middelware');
const {
    createCheckLoad,
    getAllCheckLoadsOpen,
    getLoadCheckByUserId,
    updateCheckLoad,
    deleteCheckLoad,
} = require('../controllers/load_check_controller');

const router = express.Router();

// Routes
router.post('/checkload',authenticateToken, createCheckLoad);
// router.post('/checkload2', createCheckLoad2);
router.post('/checkload/get',authenticateToken, getAllCheckLoadsOpen);
router.post('/checkload/user/:user_id',authenticateToken, getLoadCheckByUserId);
router.put('/checkload/:id',authenticateToken, updateCheckLoad);
router.delete('/checkload/:id',authenticateToken, deleteCheckLoad);


module.exports = router;