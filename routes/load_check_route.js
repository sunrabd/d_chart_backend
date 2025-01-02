// checkload_routes.js
const express = require('express');
const {
    createCheckLoad,
    getAllCheckLoadsOpen,
    //   getCheckLoadById,
    updateCheckLoad,
    deleteCheckLoad,
} = require('../controllers/load_check_controller');

const router = express.Router();

// Routes
router.post('/checkload', createCheckLoad);
router.get('/checkload', getAllCheckLoadsOpen);
// router.get('/checkload/:id', getCheckLoadById);
router.put('/checkload/:id', updateCheckLoad);
router.delete('/checkload/:id', deleteCheckLoad);

module.exports = router;