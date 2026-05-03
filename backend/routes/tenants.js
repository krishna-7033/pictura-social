const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const auth = require('../middleware/auth');

const normalizeHost = (value = '') => value.toLowerCase().replace(/:\d+$/, '').trim();

// POST /api/tenants - create a tenant + initial admin user
router.post('/', async (req, res) => {
    try {
        const { name, slug, adminEmail, adminPassword, adminUsername } = req.body;
        if (!name || !slug || !adminEmail || !adminPassword || !adminUsername) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const cleanSlug = normalizeHost(slug);
        const existing = await Tenant.findOne({ $or: [{ slug: cleanSlug }, { domain: cleanSlug }] });
        if (existing) return res.status(400).json({ message: 'Tenant slug already taken' });

        const tenant = new Tenant({ name, slug: cleanSlug });
        await tenant.save();

        const hashed = await bcrypt.hash(adminPassword, 12);
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUsername}`;

        const admin = new User({
            tenantId: tenant._id,
            username: adminUsername,
            email: adminEmail,
            password: hashed,
            avatar,
            role: 'admin'
        });

        await admin.save();

        res.status(201).json({ tenantId: tenant._id, slug: tenant.slug });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Could not create tenant', error: err.message });
    }
});

// GET /api/tenants/current - resolve current tenant for public site bootstrap
router.get('/current', async (req, res) => {
    if (!req.tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
    }

    res.json({
        tenant: {
            id: req.tenant._id,
            name: req.tenant.name,
            slug: req.tenant.slug,
            domain: req.tenant.domain,
            settings: req.tenant.settings,
        }
    });
});

// PATCH /api/tenants/:tenantId/domain - assign or change custom domain
router.patch('/:tenantId/domain', auth, async (req, res) => {
    try {
        const { domain } = req.body;
        if (!domain) {
            return res.status(400).json({ message: 'Domain is required' });
        }

        if (!req.currentUser || req.currentUser.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        if (req.userData.tenantId !== req.params.tenantId) {
            return res.status(403).json({ message: 'Tenant mismatch' });
        }

        const cleanDomain = normalizeHost(domain);
        const conflict = await Tenant.findOne({ domain: cleanDomain, _id: { $ne: req.params.tenantId } });
        if (conflict) {
            return res.status(400).json({ message: 'Domain already assigned to another tenant' });
        }

        const updated = await Tenant.findByIdAndUpdate(
            req.params.tenantId,
            { domain: cleanDomain },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        res.json({
            tenant: {
                id: updated._id,
                name: updated.name,
                slug: updated.slug,
                domain: updated.domain,
                settings: updated.settings,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Could not update domain', error: err.message });
    }
});

module.exports = router;
