const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth_middelware');
const userController = require('../controllers/user_controller'); 

// Routes
router.post('/signup', userController.signUp);
router.post('/signin', userController.signIn);
// router.post('/refresh-token', userController.refreshToken);


router.put('/:id',  userController.updateUser);
router.delete('/:id',authenticateToken,  userController.deleteUser);
router.get('/',authenticateToken,  userController.getAllMembers);
router.get('/admin',authenticateToken, userController.getAllAdmins);
router.get('/user',authenticateToken,  userController.getAllUsers);
router.get('/:id',authenticateToken,  userController.getUserById);

module.exports = router;