require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2] || process.env.CHECK_EMAIL;

async function main() {
    if (!email) {
        console.error('Usage: node scripts/findUserByEmail.js <email>');
        process.exit(1);
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI not set in .env');
        process.exit(1);
    }

    await mongoose.connect(uri);
    const user = await User.findOne({ email }).populate('tenantId', 'slug').lean();
    if (!user) {
        console.log(`No user found with email: ${email}`);
    } else {
        console.log('User found:');
        console.log(`id: ${user._id}`);
        console.log(`tenant: ${user.tenantId?.slug || user.tenantId}`);
        console.log(`username: ${user.username}`);
        console.log(`email: ${user.email}`);
    }
    await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
