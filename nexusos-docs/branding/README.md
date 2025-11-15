# Branding Configuration

This directory contains branding assets and configuration for generating **premium branded PDFs**.

## Quick Start

1. Edit `config.json` with your company details
2. Add your logo to this directory (or use a URL)
3. Run `npm run pdf-branded` to generate branded PDFs

## Configuration Options

### `config.json`

```json
{
  "companyName": "Your Company Name",
  "tagline": "Your Tagline or Slogan",
  "website": "www.yourcompany.com",
  "email": "support@yourcompany.com",
  "logoUrl": "path/to/logo.png or https://...",
  "primaryColor": "#6366f1",
  "secondaryColor": "#1e293b",
  "watermark": "CONFIDENTIAL",
  "showWatermark": false,
  "version": "1.0",
  "classification": "Internal Use Only"
}
```

### Field Descriptions

| Field | Description | Example |
|-------|-------------|---------|
| `companyName` | Your company or product name | "NexusOS", "Acme Corp" |
| `tagline` | Subtitle shown on cover page | "Enterprise Documentation Platform" |
| `website` | Company website | "www.nexusos.com" |
| `email` | Support or contact email | "support@nexusos.com" |
| `logoUrl` | Path to logo image or URL | "./branding/logo.png" |
| `primaryColor` | Main brand color (hex) | "#6366f1" (indigo) |
| `secondaryColor` | Secondary brand color | "#1e293b" (dark slate) |
| `watermark` | Text for watermark (if enabled) | "CONFIDENTIAL" |
| `showWatermark` | Show/hide watermark | `true` or `false` |
| `version` | Document version | "1.0", "2.1.3" |
| `classification` | Document classification | "Public", "Internal", "Confidential" |

## Logo Guidelines

### Recommended Logo Specifications:
- **Format**: PNG with transparent background
- **Size**: 200x60px or similar aspect ratio
- **Color**: Should work on dark gradient background
- **Location**: Place in `./branding/logo.png`

### Using External Logo:
```json
{
  "logoUrl": "https://cdn.yourcompany.com/logo.png"
}
```

## Color Scheme

Choose colors that match your brand identity:

### Popular Brand Colors:
- **Tech Blue**: `#0066cc`
- **Professional Navy**: `#003366`
- **Modern Purple**: `#6366f1` (default)
- **Corporate Gray**: `#4a5568`
- **Energy Orange**: `#ff6b35`

## Document Classification Levels

Common classification options:
- `"Public"` - No restrictions
- `"Internal Use Only"` - Company employees only
- `"Confidential"` - Restricted distribution
- `"Strictly Confidential"` - Highly restricted

## Watermark Options

Enable watermarks for sensitive documents:

```json
{
  "showWatermark": true,
  "watermark": "DRAFT - DO NOT DISTRIBUTE"
}
```

Common watermark text:
- `"CONFIDENTIAL"`
- `"DRAFT"`
- `"INTERNAL ONLY"`
- `"PROPRIETARY"`
- `"SAMPLE - NOT FOR PRODUCTION"`

## Build Commands

### Generate Branded PDFs Only:
```bash
npm run pdf-branded
```

### Generate All Outputs with Branded PDFs:
```bash
npm run build-premium
```

### Compare Regular vs Branded:
```bash
# Regular PDFs (simple, no branding)
npm run pdf

# Branded PDFs (professional cover, headers, footers)
npm run pdf-branded
```

## Output Location

Branded PDFs are saved to:
```
outputs/pdf-branded/
├── 01_api_documentation/
├── 02_user_guides/
├── 03_admin_manual/
└── ...
```

## Customization Tips

### 1. Professional Cover Pages
The cover page features:
- Company logo at top
- Document category badge
- Large title
- Tagline
- Classification label
- Footer with contact info and date

### 2. Headers & Footers
Every page includes:
- **Header**: Company name + document category
- **Footer**: Document title, classification, date, page numbers

### 3. Branded Styling
- Headings use your primary color
- Code blocks with brand-colored accent
- Tables with branded headers
- Links in primary color

## White-Label for Clients

Create client-specific branding:

1. Copy `config.json` to `config.client-name.json`
2. Update with client's brand colors and logo
3. Modify build script to use client config
4. Generate client-branded PDFs

Example:
```json
// config.acme-corp.json
{
  "companyName": "Acme Corporation",
  "logoUrl": "./branding/logos/acme-logo.png",
  "primaryColor": "#ff0000",
  "classification": "Acme Confidential"
}
```

## Examples

### Tech Startup:
```json
{
  "companyName": "TechFlow AI",
  "tagline": "Intelligence at Scale",
  "primaryColor": "#00d4ff",
  "secondaryColor": "#0a0e27"
}
```

### Enterprise Corporate:
```json
{
  "companyName": "Global Financial Services",
  "tagline": "Trusted Worldwide",
  "primaryColor": "#003366",
  "secondaryColor": "#001f3f",
  "classification": "Confidential - Client Use Only"
}
```

### Open Source Project:
```json
{
  "companyName": "OpenDocs",
  "tagline": "Documentation for Everyone",
  "primaryColor": "#28a745",
  "showWatermark": false,
  "classification": "Public"
}
```

## Support

For questions or customization help:
- Email: support@nexusos.com
- Docs: /docs/branding_guide.md
