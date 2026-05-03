const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

// POST /api/auth/signup
// Accepts either tenantSlug in body or resolves tenant by Host header
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, tenantSlug } = req.body;

    let tenant = req.tenant;
    if (tenantSlug) tenant = await Tenant.findOne({ slug: tenantSlug });
    if (!tenant && req.hostname) tenant = await Tenant.findOne({ domain: req.hostname });
    if (!tenant) return res.status(400).json({ message: 'Tenant not found. Provide tenantSlug or use tenant domain host.' });

    const existingUser = await User.findOne({ tenantId: tenant._id, $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User name already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    const newUser = new User({
      tenantId: tenant._id,
      username,
      email,
      password: hashedPassword,
      avatar,
      role: 'user'
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, tenantId: tenant._id },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      userId: newUser._id,
      username: newUser.username,
      avatar: newUser.avatar,
      token,
      tenant: { id: tenant._id, slug: tenant.slug }
    });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
});

// POST /api/auth/login
// Accepts tenantSlug in body or resolves tenant by Host header
router.post('/login', async (req, res) => {
  try {
    const { email, password, tenantSlug } = req.body;

    let tenant = req.tenant;
    if (tenantSlug) tenant = await Tenant.findOne({ slug: tenantSlug });
    if (!tenant && req.hostname) tenant = await Tenant.findOne({ domain: req.hostname });
    if (!tenant) return res.status(400).json({ message: 'Tenant not found. Provide tenantSlug or use tenant domain host.' });

    const user = await User.findOne({ tenantId: tenant._id, email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, tenantId: tenant._id },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key',
      { expiresIn: '1h' }
    );

    res.json({
      userId: user._id,
      username: user.username,
      avatar: user.avatar,
      token,
      tenant: { id: tenant._id, slug: tenant.slug }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

module.exports = router;
