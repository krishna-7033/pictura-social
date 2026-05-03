const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    domain: { type: String, default: '' },
    settings: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);
