const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller'); 

// Routes
router.post('/signup', userController.signUp);
router.post('/signin', userController.signIn);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

module.exports = router;