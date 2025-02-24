const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth_middelware');
const userController = require('../controllers/user_controller'); 

// Routes
router.post('/signup', userController.signUp);
router.post('/signin', userController.signIn);
// router.post('/refresh-token', userController.refreshToken);


router.put('/:id',  userController.updateUser);
router.delete('/:id',  userController.deleteUser);
router.get('/',  userController.getAllMembers);
router.get('/admin', userController.getAllAdmins);
router.get('/sub-admin', userController.getAllSubAdmins);

router.get('/user',  userController.getAllUsers);
router.get('/user/csv',  userController.getAllUsersForCSV);
router.get('/deleted-user',  userController.getAllDeletedUsers);
router.get('/:id',  userController.getUserById);
// check mobile number is exist or not 
router.post('/register', userController.registerUser);

router.post('/generate-referral-all', userController.generateReferralCodesForAllUsers);
module.exports = router;