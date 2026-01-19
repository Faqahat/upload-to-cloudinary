# Upload to Cloudinary - Chrome Extension

A powerful Chrome extension that lets you upload images to Cloudinary with a single right-click. Perfect for developers, content creators, and anyone who needs fast, reliable image hosting.

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![Manifest](https://img.shields.io/badge/manifest-v3-green.svg)

## Features

### 🚀 Quick Upload
- **Right-click upload:** Right-click any image on any webpage
- **Drag & drop:** Drop images into the extension popup
- **Clipboard paste:** Press Ctrl+V to paste and upload
- **Auto-copy URL:** Uploaded URL automatically copied to clipboard

### 🎨 Smart Transformations
- Convert images to WebP, AVIF, JPG, or PNG
- Resize images (custom width & height)
- Adjust quality (auto, best, good, eco, low, or numeric)
- Choose crop mode (fill, fit, scale, crop, thumbnail, pad)
- Transformations applied when copying URL

### 📚 Upload History
- View recent uploads with thumbnails
- Load more functionality (10 items at a time)
- One-click copy or delete
- Export history as JSON
- Configurable history limit (10-500 items)

### 💡 Visual Feedback
- Extension icon changes color during upload
- Desktop notifications for upload status
- Upload progress indicator
- Clean, modern interface

## Installation

### From Chrome Web Store
Coming soon! Link will be added after publication.

### From Source (Development)
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extension directory

## Setup

### 1. Create a Cloudinary Account
1. Sign up for free at [cloudinary.com](https://cloudinary.com)
2. Note your **Cloud Name** from the dashboard

### 2. Create an Unsigned Upload Preset
1. Go to Settings → Upload
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Set **Signing Mode** to "Unsigned"
5. Configure optional settings (folder, tags, etc.)
6. Save and note the **Preset name**

### 3. Configure the Extension
1. Right-click the extension icon → Options
2. Enter:
   - **Cloud Name:** Your Cloudinary cloud name
   - **Upload Preset:** Your unsigned preset name
   - **Folder** (optional): Organize uploads in a folder
   - **History Limit:** Max number of uploads to keep (10-500)
3. Save settings

### 4. Optional: Enable Transformations
1. In Options, enable "Enable transformations when copying URLs"
2. Set desired transformations:
   - **Width/Height:** Resize dimensions
   - **Quality:** Image quality level
   - **Format:** Output format (WebP, AVIF, JPG, PNG)
   - **Crop Mode:** How to handle resize
3. Transformations are applied when copying URLs

## Usage

### Upload via Right-Click
1. Right-click any image on a webpage
2. Select "Upload to Cloudinary"
3. URL is automatically copied to clipboard
4. Notification appears when complete

### Upload via Popup
1. Click the extension icon
2. **Drag & drop** an image, or
3. **Click** the drop zone to select a file, or
4. **Press Ctrl+V** to paste from clipboard
5. URL is automatically copied

### View History
1. Click the extension icon
2. See recent uploads with thumbnails
3. Click URL to copy again
4. Click trash icon to delete from history
5. Click "Load More" to see older uploads
6. Click export icon to download history as JSON

## File Structure

```
cloudinary-upload/
├── manifest.json          # Extension manifest (MV3)
├── background.js          # Service worker for uploads
├── popup.html            # Popup UI
├── popup.js              # Popup logic
├── popup.css             # Popup styles
├── options.html          # Settings page
├── options.js            # Settings logic
├── offscreen.html        # Offscreen document for clipboard
├── offscreen.js          # Clipboard operations
├── icons/                # Extension icons
│   ├── icon_16x16.png
│   ├── icon_64x64.png
│   ├── icon_128x128.png
│   ├── icon_16x16_loading.png
│   ├── icon_64x64_loading.png
│   └── icon_128x128_loading.png
├── README.md             # This file
├── PRIVACY_POLICY.md     # Privacy policy
└── STORE_LISTING.md      # Chrome Web Store listing text
```

## Transformations

When enabled, transformations modify the Cloudinary URL to apply image processing:

```
Original:
https://res.cloudinary.com/demo/image/upload/sample.jpg

With transformations (w_800, f_webp):
https://res.cloudinary.com/demo/image/upload/w_800,f_webp/sample.webp
```

### Supported Transformations
- **Width:** `w_800` - Resize width
- **Height:** `h_600` - Resize height
- **Crop:** `c_fill` - Crop mode
- **Quality:** `q_auto` - Quality level
- **Format:** `f_webp` - Output format

## Privacy & Security

- ✅ All data stored **locally** on your device
- ✅ No tracking or analytics
- ✅ Direct upload to **your** Cloudinary account
- ✅ Uses unsigned uploads (no API keys stored)
- ✅ Open source - verify the code yourself

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for details.

## Troubleshooting

### Upload fails with "Configuration Missing"
- Make sure you've entered Cloud Name and Upload Preset in Options
- Verify the preset is set to "Unsigned" mode in Cloudinary

### Transformations not working
- Make sure "Enable transformations" is checked in Options
- Transformations only apply when copying URLs, not during upload
- The original image is always stored without transformations

### Clipboard not working
- The extension uses offscreen documents for reliable clipboard access
- If issues persist, try reloading the extension

## Development

### Building for Chrome Web Store
```bash
# Create ZIP for submission
zip -r cloudinary-upload.zip . -x "*.git*" "*.DS_Store" "*node_modules/*" "create_icons.js"
```

## Support

- **Issues:** Report bugs or request features
- **Cloudinary Docs:** [cloudinary.com/documentation](https://cloudinary.com/documentation)

## License

This project is open source and available under the MIT License.

---

**Made for the Cloudinary community**
