const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// GET /api/posts
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Fetching posts failed' });
  }
});

// POST /api/posts/create-post
router.post('/create-post', auth, async (req, res) => {
  try {
    const { imageUrl, caption } = req.body;

    // In a real app with Cloudinary, you would upload the image here
    // or use a middleware like multer-storage-cloudinary before this controller.
    // For this example, we assume imageUrl is already a Cloudinary URL or Base64 string from frontend.

    const newPost = new Post({
      tenantId: req.userData.tenantId,
      user: req.userData.userId,
      imageUrl,
      caption
    });

    await newPost.save();

    const populatedPost = await Post.findById(newPost._id).populate('user', 'username avatar');
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Creating post failed', error: error.message });
  }
});

// PUT /api/posts/:postId - edit a post (caption)
router.put('/:postId', auth, async (req, res) => {
  try {
    const { caption } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.user.toString() !== req.userData.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    post.caption = caption;
    await post.save();
    const populated = await Post.findById(post._id).populate('user', 'username avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Editing post failed' });
  }
});

// DELETE /api/posts/:postId - delete a post
router.delete('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.user.toString() !== req.userData.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.deleteOne({ _id: post._id });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Deleting post failed' });
  }
});

// POST /api/posts/like/:postId
router.post('/like/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.userData.userId;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    // determine if this action added a like or removed one
    const wasLiked = isLiked; // previously liked
    await post.save();

    // create notification when liking someone else's post (only on new like)
    try {
      const postOwnerId = post.user.toString();
      const actorId = req.userData.userId;
      if (!wasLiked && postOwnerId !== actorId) {
        const notif = new Notification({
          tenantId: req.userData.tenantId,
          user: postOwnerId,
          actor: actorId,
          type: 'like',
          post: post._id,
        });
        await notif.save();
      }
    } catch (e) {
      console.error('Failed to create notification', e.message);
    }

    res.json({ likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: 'Liking post failed' });
  }
});

// POST /api/posts/comment/:postId
router.post('/comment/:postId', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({
      user: req.userData.userId,
      text
    });

    await post.save();

    // Populate the newly added comment's user
    const updatedPost = await Post.findById(post._id).populate('comments.user', 'username avatar');
    res.json({ comments: updatedPost.comments });
  } catch (error) {
    res.status(500).json({ message: 'Commenting failed' });
  }
});

module.exports = router;
