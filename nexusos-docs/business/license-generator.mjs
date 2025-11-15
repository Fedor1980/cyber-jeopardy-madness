#!/usr/bin/env node
// License Key Generator for NexusOS Documentation Platform
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const LICENSES_FILE = 'business/licenses.json';
const SECRET_KEY = process.env.LICENSE_SECRET || 'nexusos-secret-key-change-in-production';

// License tiers
const TIERS = {
  FREE: 'free',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise'
};

// License features
const FEATURES = {
  [TIERS.FREE]: [
    'HTML generation',
    'Interactive search',
    'Dark mode',
    'Diagram rendering',
    'Basic PDFs',
    'Slides generation',
    'Community support'
  ],
  [TIERS.PROFESSIONAL]: [
    'All Free features',
    'Branded PDFs',
    'White-label customization',
    'Watermark support',
    'Priority email support',
    'Commercial license',
    'Lifetime updates'
  ],
  [TIERS.ENTERPRISE]: [
    'All Professional features',
    'Custom integrations',
    'On-premise deployment support',
    'SLA guarantees',
    'Training sessions (2 hours)',
    'White-glove onboarding',
    'Unlimited installs',
    'Phone support'
  ]
};

class LicenseGenerator {
  constructor() {
    this.ensureLicensesFile();
  }

  ensureLicensesFile() {
    const dir = path.dirname(LICENSES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(LICENSES_FILE)) {
      fs.writeFileSync(LICENSES_FILE, JSON.stringify({ licenses: [] }, null, 2));
    }
  }

  loadLicenses() {
    const data = fs.readFileSync(LICENSES_FILE, 'utf8');
    return JSON.parse(data);
  }

  saveLicenses(data) {
    fs.writeFileSync(LICENSES_FILE, JSON.stringify(data, null, 2));
  }

  generateLicenseKey(tier, customerEmail, customerName) {
    // Create payload
    const payload = {
      tier,
      email: customerEmail,
      name: customerName,
      issuedAt: new Date().toISOString(),
      expiresAt: tier === TIERS.FREE ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null // Free expires in 1 year, others never expire
    };

    // Create signature
    const payloadStr = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(payloadStr)
      .digest('hex');

    // Combine into license key
    const licenseData = {
      ...payload,
      signature
    };

    // Encode to base64
    const licenseKey = Buffer.from(JSON.stringify(licenseData)).toString('base64');

    // Format as XXXXX-XXXXX-XXXXX-XXXXX for readability
    const formatted = licenseKey.match(/.{1,5}/g).join('-').substring(0, 29);

    return {
      key: formatted,
      raw: licenseKey,
      payload
    };
  }

  verifyLicenseKey(licenseKey) {
    try {
      // Remove dashes
      const raw = licenseKey.replace(/-/g, '');

      // Decode from base64
      const decoded = Buffer.from(raw, 'base64').toString('utf8');
      const licenseData = JSON.parse(decoded);

      // Verify signature
      const { signature, ...payload } = licenseData;
      const payloadStr = JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(payloadStr)
        .digest('hex');

      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' };
      }

      // Check expiration
      if (licenseData.expiresAt) {
        const expiresAt = new Date(licenseData.expiresAt);
        if (expiresAt < new Date()) {
          return { valid: false, error: 'License expired' };
        }
      }

      return {
        valid: true,
        tier: licenseData.tier,
        email: licenseData.email,
        name: licenseData.name,
        issuedAt: licenseData.issuedAt,
        expiresAt: licenseData.expiresAt,
        features: FEATURES[licenseData.tier]
      };
    } catch (error) {
      return { valid: false, error: 'Invalid license key format' };
    }
  }

  createLicense(tier, customerEmail, customerName, orderId = null) {
    // Generate license key
    const { key, raw, payload } = this.generateLicenseKey(tier, customerEmail, customerName);

    // Load existing licenses
    const data = this.loadLicenses();

    // Add new license
    const license = {
      id: crypto.randomUUID(),
      orderId,
      tier,
      customerEmail,
      customerName,
      licenseKey: key,
      rawKey: raw,
      issuedAt: payload.issuedAt,
      expiresAt: payload.expiresAt,
      status: 'active'
    };

    data.licenses.push(license);
    this.saveLicenses(data);

    return license;
  }

  listLicenses(filter = {}) {
    const data = this.loadLicenses();
    let licenses = data.licenses;

    if (filter.tier) {
      licenses = licenses.filter(l => l.tier === filter.tier);
    }

    if (filter.email) {
      licenses = licenses.filter(l => l.customerEmail === filter.email);
    }

    if (filter.status) {
      licenses = licenses.filter(l => l.status === filter.status);
    }

    return licenses;
  }

  revokeLicense(licenseKey) {
    const data = this.loadLicenses();
    const license = data.licenses.find(l => l.licenseKey === licenseKey);

    if (!license) {
      return { success: false, error: 'License not found' };
    }

    license.status = 'revoked';
    license.revokedAt = new Date().toISOString();
    this.saveLicenses(data);

    return { success: true, license };
  }

  generateActivationEmail(license) {
    const features = FEATURES[license.tier].map(f => `  • ${f}`).join('\n');

    return `
Subject: Your NexusOS Documentation Platform License

Hi ${license.customerName},

Thank you for purchasing NexusOS Documentation Platform - ${license.tier.toUpperCase()} Edition!

Your License Key:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${license.licenseKey}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Features Included:
${features}

Getting Started:
1. Download: https://github.com/nexusos/docs-platform
2. Install: npm install
3. Configure: Add your branding to branding/config.json
4. Build: npm run build-premium
5. Deploy: Upload outputs/html to your server

Documentation: https://docs.nexusos.com
Support: support@nexusos.com

${license.expiresAt ? `License Valid Until: ${new Date(license.expiresAt).toLocaleDateString()}` : 'License: Lifetime (Never Expires)'}

Questions? Reply to this email or contact support@nexusos.com

Best regards,
The NexusOS Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NexusOS Documentation Platform
www.nexusos.com
`;
  }
}

// CLI Interface
const args = process.argv.slice(2);
const command = args[0];

const generator = new LicenseGenerator();

switch (command) {
  case 'create': {
    const tier = args[1] || TIERS.PROFESSIONAL;
    const email = args[2];
    const name = args[3];
    const orderId = args[4];

    if (!email || !name) {
      console.error('Usage: node license-generator.mjs create <tier> <email> <name> [orderId]');
      console.error(`Tiers: ${Object.values(TIERS).join(', ')}`);
      process.exit(1);
    }

    const license = generator.createLicense(tier, email, name, orderId);
    console.log('\n✅ License Created Successfully!\n');
    console.log(`ID: ${license.id}`);
    console.log(`Tier: ${license.tier.toUpperCase()}`);
    console.log(`Customer: ${license.customerName} (${license.customerEmail})`);
    console.log(`License Key: ${license.licenseKey}`);
    console.log(`Issued: ${new Date(license.issuedAt).toLocaleString()}`);
    if (license.expiresAt) {
      console.log(`Expires: ${new Date(license.expiresAt).toLocaleString()}`);
    } else {
      console.log(`Expires: Never`);
    }

    console.log('\n📧 Activation Email:\n');
    console.log(generator.generateActivationEmail(license));
    break;
  }

  case 'verify': {
    const key = args[1];
    if (!key) {
      console.error('Usage: node license-generator.mjs verify <license-key>');
      process.exit(1);
    }

    const result = generator.verifyLicenseKey(key);
    if (result.valid) {
      console.log('\n✅ License Valid!\n');
      console.log(`Tier: ${result.tier.toUpperCase()}`);
      console.log(`Customer: ${result.name} (${result.email})`);
      console.log(`Issued: ${new Date(result.issuedAt).toLocaleString()}`);
      if (result.expiresAt) {
        console.log(`Expires: ${new Date(result.expiresAt).toLocaleString()}`);
      } else {
        console.log(`Expires: Never`);
      }
      console.log(`\nFeatures:`);
      result.features.forEach(f => console.log(`  • ${f}`));
    } else {
      console.error(`\n❌ License Invalid: ${result.error}\n`);
      process.exit(1);
    }
    break;
  }

  case 'list': {
    const tier = args[1];
    const licenses = generator.listLicenses({ tier });

    console.log(`\nFound ${licenses.length} license(s):\n`);
    licenses.forEach(l => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`ID: ${l.id}`);
      console.log(`Tier: ${l.tier.toUpperCase()}`);
      console.log(`Customer: ${l.customerName} (${l.customerEmail})`);
      console.log(`Key: ${l.licenseKey}`);
      console.log(`Status: ${l.status}`);
      console.log(`Issued: ${new Date(l.issuedAt).toLocaleString()}`);
    });
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    break;
  }

  case 'revoke': {
    const key = args[1];
    if (!key) {
      console.error('Usage: node license-generator.mjs revoke <license-key>');
      process.exit(1);
    }

    const result = generator.revokeLicense(key);
    if (result.success) {
      console.log(`\n✅ License revoked: ${key}\n`);
    } else {
      console.error(`\n❌ Error: ${result.error}\n`);
      process.exit(1);
    }
    break;
  }

  default:
    console.log(`
NexusOS Documentation Platform - License Generator

Commands:
  create <tier> <email> <name> [orderId]  - Create a new license
  verify <license-key>                    - Verify a license key
  list [tier]                             - List all licenses (optionally filter by tier)
  revoke <license-key>                    - Revoke a license

Tiers:
  ${Object.values(TIERS).join(', ')}

Examples:
  node license-generator.mjs create professional john@example.com "John Doe" ORDER-123
  node license-generator.mjs verify XXXXX-XXXXX-XXXXX-XXXXX
  node license-generator.mjs list professional
  node license-generator.mjs revoke XXXXX-XXXXX-XXXXX-XXXXX
`);
    break;
}
