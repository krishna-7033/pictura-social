const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// GET /api/notifications - list current user's notifications
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.userData.userId })
            .populate('actor', 'username avatar')
            .populate('post', 'imageUrl caption')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: 'Fetching notifications failed' });
    }
});

// POST /api/notifications/:id/read - mark a notification as read
router.post('/:id/read', auth, async (req, res) => {
    try {
        const notif = await Notification.findById(req.params.id);
        if (!notif) return res.status(404).json({ message: 'Notification not found' });
        if (notif.user.toString() !== req.userData.userId) return res.status(403).json({ message: 'Not authorized' });

        notif.read = true;
        await notif.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Mark read failed' });
    }
});

module.exports = router;
