# Business Infrastructure

This directory contains sales, licensing, and monetization tools for the NexusOS Documentation Platform.

## 📁 Files

### `SALES_PAGE.html`
**Professional sales landing page** for the product

Features:
- Hero section with CTA
- Features showcase
- Pricing tiers (Free, Professional, Enterprise)
- Testimonials
- Responsive design
- Ready to deploy

**Usage:**
1. Customize company details and pricing
2. Host on GitHub Pages, Netlify, or Vercel
3. Point your domain to the page
4. Start selling!

### `license-generator.mjs`
**License key generation and management system**

Features:
- Generate cryptographically signed license keys
- Verify license validity
- List all licenses
- Revoke licenses
- Generate activation emails

**Commands:**

```bash
# Create a new license
node business/license-generator.mjs create professional john@example.com "John Doe" ORDER-123

# Verify a license key
node business/license-generator.mjs verify XXXXX-XXXXX-XXXXX-XXXXX

# List all licenses (or filter by tier)
node business/license-generator.mjs list
node business/license-generator.mjs list professional

# Revoke a license
node business/license-generator.mjs revoke XXXXX-XXXXX-XXXXX-XXXXX
```

**Security:**
- Set `LICENSE_SECRET` environment variable in production
- Never commit `licenses.json` to version control
- Store licenses in a secure database for production

### `licenses.json`
**License database** (auto-generated)

Contains all issued licenses with:
- License IDs
- Customer information
- License keys
- Issue/expiry dates
- Status (active/revoked)

**Important:**
- Add `licenses.json` to `.gitignore`
- Back up regularly
- Use encrypted storage in production

---

## 🚀 Getting Started

### 1. Set Up Sales Page

```bash
# Edit SALES_PAGE.html
# Customize pricing, features, testimonials

# Deploy to GitHub Pages
git add business/SALES_PAGE.html
git commit -m "Add sales page"
git push

# Enable GitHub Pages in repo settings
# Point to /business/SALES_PAGE.html
```

### 2. Configure License Generator

```bash
# Set secret key (REQUIRED for production)
export LICENSE_SECRET="your-secret-key-here-change-me"

# Create your first license
node business/license-generator.mjs create professional \
  customer@example.com \
  "Customer Name" \
  ORDER-12345
```

### 3. Handle Sales

When a customer purchases:

1. **Create License:**
   ```bash
   node business/license-generator.mjs create professional \
     customer@email.com \
     "Customer Name" \
     STRIPE-ORDER-ID
   ```

2. **Send Activation Email:**
   - Copy the generated email output
   - Send to customer
   - Include license key prominently

3. **Customer Activation:**
   - Customer downloads the platform
   - Customer adds their license key (if you implement verification)
   - Customer accesses Professional features

---

## 💰 Pricing Recommendations

### Free Tier
- **Price:** $0
- **Target:** Open source projects, students, hobbyists
- **Strategy:** Build community, get feedback, create advocates

### Professional Tier
- **Price:** $99 one-time
- **Target:** Small teams (5-20 people), startups, agencies
- **Strategy:** Affordable for companies, profitable for you
- **Value:** Branded PDFs save hours of manual formatting

### Enterprise Tier
- **Price:** $499 one-time
- **Target:** Large companies (50+ people), enterprises
- **Strategy:** Premium support justifies price
- **Value:** SLA + training + phone support = confidence

### Pricing Psychology
- One-time payment > subscription (no churn, easier sales)
- Anchor high (Enterprise) makes Professional look cheap
- Free tier builds trust and awareness

---

## 📧 Email Templates

### Welcome Email (Free Users)

```
Subject: Welcome to NexusOS Documentation Platform!

Hi there,

Thanks for downloading NexusOS Documentation Platform!

Quick Start:
1. npm install
2. Add your docs to docs/
3. npm run build
4. Open outputs/html/index.html

Need help? Check out our docs or join our Discord.

Ready to upgrade? Professional edition unlocks:
• Branded PDFs with your logo
• White-label customization
• Priority support

Upgrade now: [link to pricing]

Happy documenting!
The NexusOS Team
```

### Purchase Confirmation (Professional)

```
Subject: Your NexusOS Professional License

Hi [Name],

Thank you for your purchase!

Your License Key:
━━━━━━━━━━━━━━━━━━━━━━━━━━
[LICENSE-KEY]
━━━━━━━━━━━━━━━━━━━━━━━━━━

What's Included:
• Branded PDFs with custom covers
• White-label customization
• Watermark support
• Priority email support (48hr response)
• Lifetime updates
• Commercial license

Getting Started:
1. Download: [link]
2. Configure branding: Edit branding/config.json
3. Build: npm run build-premium
4. Deploy: Upload outputs/

Questions? Reply to this email.

Best,
The NexusOS Team
```

### Enterprise Onboarding

```
Subject: Welcome to NexusOS Enterprise

Hi [Name],

Welcome to NexusOS Enterprise!

Your dedicated account manager will contact you within 24 hours to schedule your:
• 2-hour training session
• White-glove onboarding call
• Custom integration planning

In the meantime:
License Key: [KEY]
Priority Support: support@nexusos.com
Phone: +1-XXX-XXX-XXXX

We're excited to work with you!

Best,
[Your Name]
Enterprise Success Team
```

---

## 🔐 Security Best Practices

### License Keys
1. **Use environment variables** for `LICENSE_SECRET`
2. **Rotate secrets** periodically
3. **Never** commit `licenses.json` to git
4. **Encrypt** license database at rest
5. **Monitor** for key sharing/abuse

### Customer Data
1. **Collect minimum** information needed
2. **Comply** with GDPR/privacy laws
3. **Secure** database with encryption
4. **Back up** regularly
5. **Delete** upon request

### Payment Processing
1. **Never** store credit card details yourself
2. **Use** Stripe, Paddle, or Gumroad
3. **Enable** fraud detection
4. **Require** email verification
5. **Issue** invoices automatically

---

## 📊 Sales Metrics to Track

### Key Metrics
- **Conversion Rate:** Visitors → Customers
- **Average Order Value:** Revenue / Orders
- **Customer Acquisition Cost:** Marketing $ / Customers
- **Lifetime Value:** Revenue / Customer over time
- **Churn Rate:** Canceled / Total (if applicable)

### Growth Metrics
- Downloads per month
- License activations per month
- Support tickets per customer
- Feature requests by tier
- Referrals and word-of-mouth

---

## 🎯 Marketing Strategies

### Content Marketing
- Blog about documentation best practices
- Tutorial videos on YouTube
- Case studies with real customers
- Open source templates and examples

### Community Building
- Discord server for users
- GitHub Discussions for feedback
- Monthly webinars or demos
- Showcase user-generated docs

### Partnerships
- Integrate with GitBook, Notion, Confluence
- Partner with development tools
- Sponsor developer conferences
- Guest posts on tech blogs

### Paid Advertising
- Google Ads (keywords: "documentation platform", "markdown to pdf")
- Reddit ads in r/programming, r/webdev
- Twitter/LinkedIn ads targeting CTOs, tech leads
- Retargeting visitors who didn't convert

---

## 📈 Scaling Your Business

### Automation
- Auto-send license emails via Zapier/Make
- Stripe webhooks for instant provisioning
- Automated onboarding sequences
- Self-service license management portal

### Support
- Knowledge base for common questions
- Video tutorials for setup
- Community forum for peer help
- SLA-based support tiers

### Product Development
- Survey customers for feature requests
- Build based on Enterprise needs (highest value)
- Release updates monthly
- Announce features to drive upgrades

---

## 💡 Upsell Opportunities

### Free → Professional
- "Unlock branded PDFs" CTA in free version
- Email campaign highlighting Professional features
- Limited-time discount codes
- "Your docs deserve better branding"

### Professional → Enterprise
- "Need custom integrations?" prompt
- White-glove onboarding offer
- SLA guarantees for compliance
- Volume licensing for teams

### Add-Ons (Future)
- Custom themes marketplace
- Premium diagram templates
- Hosted documentation service
- API documentation generator

---

## 🎓 Resources

### Tools
- **Stripe:** Payment processing
- **Gumroad:** Simple digital sales
- **ConvertKit:** Email marketing
- **Hotjar:** Website analytics
- **Intercom:** Customer chat

### Legal
- Terms of Service template
- Privacy Policy generator
- Software License Agreement
- Refund policy guidelines

### Learning
- Indie Hackers community
- MicroConf talks
- SaaS marketing blogs
- Pricing strategy books

---

## 📞 Support

Questions about monetization?
- Email: sales@nexusos.com
- Discord: [link]
- Twitter: @nexusos

Good luck with your sales! 🚀
