const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth_middelware');
const userController = require('../controllers/user_controller'); 

// Routes
router.post('/signup', userController.signUp);
router.post('/signin', userController.signIn);
// router.post('/refresh-token', userController.refreshToken);


router.put('/:id',authenticateToken,userController.updateUser);
router.delete('/:id',authenticateToken,userController.deleteUser);
router.post('/',authenticateToken,userController.getAllMembers);
router.post('/admin',authenticateToken,userController.getAllAdmins);
router.post('/sub-admin',authenticateToken,userController.getAllSubAdmins);

router.post('/user',authenticateToken,userController.getAllUsers);
router.post('/user/csv',authenticateToken,  userController.getAllUsersForCSV);
router.post('/deleted-user',authenticateToken,  userController.getAllDeletedUsers);
router.post('/:id',authenticateToken, userController.getUserById);
// check mobile number is exist or not 
router.post('/register', userController.registerUser);

router.post('/generate-referral-all',authenticateToken, userController.generateReferralCodesForAllUsers);
module.exports = router;