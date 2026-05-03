require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

async function main() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI not set in .env');
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const users = await User.find().populate('tenantId', 'slug domain name').lean();
    console.log(`Found ${users.length} users:\n`);
    users.forEach(u => {
        console.log(`${u._id} | tenant=${u.tenantId?.slug || u.tenantId} | username=${u.username} | email=${u.email}`);
    });

    await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
