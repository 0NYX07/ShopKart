const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ statusCode: 400, message: 'All fields are mandatory' });
    }

    if (password.length < 6) {
      return res.status(400).json({ statusCode: 400, message: 'Password must be at least 6 characters' });
    }

    const customerExists = await Customer.findOne({ email });

    if (customerExists) {
      return res.status(409).json({ statusCode: 409, message: 'Email already exists' });
    }

    const customer = await Customer.create({
      fullName,
      email,
      password,
      phone,
    });

    if (customer) {
      const token = generateToken(res, customer._id);
      res.status(201).json({
        statusCode: 201,
        success: true,
        message: 'Customer registered successfully',
        token,
        customer: {
          _id: customer._id,
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
        },
      });
    } else {
      res.status(400).json({ statusCode: 400, message: 'Invalid customer data' });
    }
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
};

const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });

    if (customer && (await customer.matchPassword(password))) {
      const token = generateToken(res, customer._id);

      res.json({
        statusCode: 200,
        success: true,
        token,
        customer: {
          _id: customer._id,
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
        },
        message: 'Login successful',
      });
    } else {
      res.status(401).json({ statusCode: 401, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
};

const getMyProfile = async (req, res) => {
  const customer = await Customer.findById(req.user._id);

  if (customer) {
    res.json({
      statusCode: 200,
      _id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
    });
  } else {
    res.status(404).json({ statusCode: 404, message: 'Customer not found' });
  }
};

const logoutCustomer = async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    statusCode: 200,
    success: true,
    message: 'Logged out successfully',
  });
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ statusCode: 400, message: 'Both old and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ statusCode: 400, message: 'New password must be at least 6 characters' });
    }

    const customer = await Customer.findById(req.user._id);

    if (customer && (await customer.matchPassword(oldPassword))) {
      customer.password = newPassword;
      await customer.save();

      res.status(200).json({
        statusCode: 200,
        success: true,
        message: 'Password changed successfully',
      });
    } else {
      res.status(401).json({ statusCode: 401, message: 'Incorrect old password' });
    }
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select('-password');
    res.status(200).json({
      statusCode: 200,
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword,
  getAllCustomers,
};
