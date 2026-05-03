const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// GET /api/users/profile/:username
router.get('/profile/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ tenantId: req.userData.tenantId, username: req.params.username })
      .select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ user: user._id })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({ user, posts });
  } catch (error) {
    res.status(500).json({ message: 'Fetching profile failed' });
  }
});

// POST /api/users/follow/:id
router.post('/follow/:id', auth, async (req, res) => {
  try {
    const userToFollow = await User.findOne({ _id: req.params.id, tenantId: req.userData.tenantId });
    const currentUser = await User.findOne({ _id: req.userData.userId, tenantId: req.userData.tenantId });

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      currentUser.following.pull(userToFollow._id);
      userToFollow.followers.pull(currentUser._id);
    } else {
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ following: currentUser.following, isFollowing: !isFollowing });
  } catch (error) {
    res.status(500).json({ message: 'Follow action failed' });
  }
});

module.exports = router;
