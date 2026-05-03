const Tenant = require('../models/Tenant');

const normalizeHost = (value = '') => value.toLowerCase().replace(/:\d+$/, '').trim();

// Resolve tenant from Host header (subdomain) or X-Tenant-Slug header
module.exports = async function tenantResolver(req, res, next) {
    try {
        if (req.path === '/healthz') {
            return next();
        }

        const shouldResolveTenant = req.path === '/api/tenants/current' || req.headers['x-tenant-slug'];
        if (!shouldResolveTenant) {
            return next();
        }

        const host = normalizeHost(req.headers['x-forwarded-host'] || req.hostname || req.headers.host || '');

        // if header provided, use it
        const headerSlug = req.headers['x-tenant-slug'];
        if (headerSlug) {
            const tenant = await Tenant.findOne({ slug: normalizeHost(headerSlug) });
            if (tenant) {
                req.tenant = tenant;
                return next();
            }
        }

        // Try subdomain resolution: subdomain.example.com
        const parts = host.split('.');
        if (parts.length > 2) {
            const sub = parts[0];
            const tenant = await Tenant.findOne({ slug: sub });
            if (tenant) {
                req.tenant = tenant;
                return next();
            }
        }

        // Try direct domain match
        const tenantByDomain = await Tenant.findOne({ domain: host });
        if (tenantByDomain) {
            req.tenant = tenantByDomain;
            return next();
        }

        // No tenant found - leave req.tenant undefined for public routes
        return next();
    } catch (err) {
        next(err);
    }
};
