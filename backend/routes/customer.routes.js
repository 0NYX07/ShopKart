const express = require('express');
const {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword,
  getAllCustomers,
} = require('../controllers/customer.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', getAllCustomers);
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/me', protect, getMyProfile);
router.post('/logout', protect, logoutCustomer);
router.patch('/change-password', protect, changePassword);

module.exports = router;
