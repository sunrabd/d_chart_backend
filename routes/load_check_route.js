// checkload_routes.js
const express = require('express');
const {
    createCheckLoad,
    getAllCheckLoadsOpen,
    getLoadCheckByUserId,
    updateCheckLoad,
    deleteCheckLoad,
} = require('../controllers/load_check_controller');

const router = express.Router();

// Routes
router.post('/checkload', createCheckLoad);
router.get('/checkload', getAllCheckLoadsOpen);
router.get('/checkload/user/:user_id', getLoadCheckByUserId);
router.put('/checkload/:id', updateCheckLoad);
router.delete('/checkload/:id', deleteCheckLoad);


module.exports = router;