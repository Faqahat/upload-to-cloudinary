# Privacy Policy for Upload to Cloudinary Chrome Extension

**Last Updated:** January 19, 2026

## Overview

Upload to Cloudinary ("the Extension") is committed to protecting your privacy. This privacy policy explains how the Extension collects, uses, and protects your information.

## Information Collection and Use

### Information We Store Locally

The Extension stores the following data **locally on your device only** using Chrome's storage API:

1. **Cloudinary Configuration:**
   - Cloud Name
   - Upload Preset name
   - Optional folder name
   - Transformation settings (width, height, quality, format, crop mode)
   - History limit setting

2. **Upload History:**
   - Image URLs (hosted on your Cloudinary account)
   - Upload timestamps
   - Limited to user-configured maximum (10-500 items)

### Information We Do NOT Collect

- We do NOT collect any personal information
- We do NOT track your browsing history
- We do NOT collect analytics or telemetry
- We do NOT store your Cloudinary API keys or secrets
- We do NOT transmit any data to our servers (we don't have any!)

## Data Transmission

The Extension communicates directly with:

1. **Cloudinary API** (api.cloudinary.com)
   - Uploads images directly to YOUR Cloudinary account
   - Uses unsigned upload (no sensitive credentials transmitted)
   - Subject to [Cloudinary's Privacy Policy](https://cloudinary.com/privacy)

2. **No other third parties**
   - No analytics services
   - No tracking services
   - No advertising networks

## Data Storage

All data is stored locally on your device using Chrome's `chrome.storage.local` API:

- Configuration settings are stored until you uninstall the Extension or clear data
- Upload history is stored until you manually clear it or uninstall the Extension
- No data is synced to Google's servers or any cloud service

## Permissions Explanation

The Extension requests the following permissions:

- **contextMenus:** To add "Upload to Cloudinary" option when you right-click images
- **storage:** To save your settings and upload history locally
- **notifications:** To show upload success/failure notifications
- **activeTab:** To access images on the current page when you right-click them
- **offscreen:** To reliably copy URLs to your clipboard
- **clipboardWrite:** To copy uploaded image URLs to clipboard
- **host_permissions (api.cloudinary.com):** To upload images to Cloudinary

## Data Security

- All settings and history are stored locally on your device
- Communication with Cloudinary uses HTTPS encryption
- No sensitive credentials (API keys/secrets) are used or stored
- The Extension uses Cloudinary's unsigned upload feature for security

## Data Deletion

You can delete your data at any time:

1. **Clear Upload History:** Click "Clear All" in the extension popup
2. **Remove Settings:** Uninstall the extension from Chrome
3. **Complete Removal:** Right-click extension icon → Remove from Chrome

## Third-Party Services

This Extension integrates with Cloudinary (cloudinary.com):

- Images are uploaded directly to your Cloudinary account
- Cloudinary's processing and storage are subject to [Cloudinary's Terms of Service](https://cloudinary.com/tos) and [Privacy Policy](https://cloudinary.com/privacy)
- We are not responsible for Cloudinary's data practices

## Children's Privacy

This Extension does not knowingly collect information from children under 13. The Extension is intended for general use and does not target children.

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be posted in the Extension's Chrome Web Store listing and in the Extension's repository.

## Your Rights

You have the right to:

- Access your locally stored data (in Chrome's storage)
- Delete your data at any time
- Stop using the Extension and remove all data by uninstalling

## Contact

For privacy concerns or questions:

- GitHub: https://github.com/faqahat/upload-to-cloudinary
- Email: faqahatk@gmail.com

## Compliance

This Extension complies with:

- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)

## Open Source

This Extension is open source. You can review the complete source code to verify our privacy practices at: https://github.com/faqahat/upload-to-cloudinary

---

**By using this Extension, you agree to this privacy policy.**
