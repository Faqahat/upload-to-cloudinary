// background.js

// Icon paths
const ICON_DEFAULT = {
    16: 'icons/icon_16x16.png',
    48: 'icons/icon_48x48.png',
    128: 'icons/icon_128x128.png'
};

const ICON_LOADING = {
    16: 'icons/icon_16x16_loading.png',
    48: 'icons/icon_48x48_loading.png',
    128: 'icons/icon_128x128_loading.png'
};

// Set extension icon
function setIcon(isLoading) {
    chrome.action.setIcon({
        path: isLoading ? ICON_LOADING : ICON_DEFAULT
    });
}

// Initialize context menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "upload-to-cloudinary",
        title: "Upload to Cloudinary",
        contexts: ["image"]
    });
});

// Handle click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "upload-to-cloudinary") {
        const imageUrl = info.srcUrl;

        // Set loading icon
        setIcon(true);

        // Show "Uploading..." notification
        notify('Uploading to Cloudinary...', 'Please wait...');

        try {
            // 1. Get Settings
            const settings = await getSettings();
            if (!settings.cloudName || !settings.uploadPreset) {
                notify('Configuration Missing', 'Please set your Cloud Name and Upload Preset in the extension options.');
                chrome.runtime.openOptionsPage();
                setIcon(false);
                return;
            }

            // 2. Fetch the image to a blob
            let blob;
            try {
                const response = await fetch(imageUrl);
                if (!response.ok) throw new Error('Failed to download image.');
                blob = await response.blob();
            } catch (err) {
                blob = imageUrl;
            }

            // 3. Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', blob);
            formData.append('upload_preset', settings.uploadPreset);
            if (settings.folder) {
                formData.append('folder', settings.folder);
            }

            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${settings.cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) {
                const errData = await uploadRes.json();
                throw new Error(errData.error?.message || 'Upload failed');
            }

            const data = await uploadRes.json();
            const uploadedUrl = data.secure_url;

            // 4. Save to upload history
            await saveToHistory(uploadedUrl);

            // 5. Apply transformations if enabled and copy to clipboard
            const { transformations } = await chrome.storage.local.get('transformations');
            const finalUrl = applyTransformations(uploadedUrl, transformations);
            
            // 6. Copy to Clipboard using offscreen document
            await copyToClipboardViaOffscreen(finalUrl);
            notify('Upload Successful!', 'Image URL copied to clipboard.');

        } catch (error) {
            notify('Upload Failed', error.message);
        } finally {
            // Reset icon back to default
            setIcon(false);
        }
    }
});


// Listen for test notification
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendResponse({ status: 'ok' });
});

// Utility: get settings
function getSettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['cloudName', 'uploadPreset', 'folder'], (items) => {
            resolve(items);
        });
    });
}

// Apply URL transformations
function applyTransformations(url, transformSettings) {
    if (!transformSettings || !transformSettings.enabled) {
        return url;
    }
    
    // Parse Cloudinary URL and insert transformations
    // Format: https://res.cloudinary.com/cloud/image/upload/[transformations]/path
    try {
        const urlObj = new URL(url);
        if (!urlObj.hostname.includes('cloudinary')) return url;
        
        const parts = urlObj.pathname.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return url;
        
        // Build transformation string
        const transforms = [];
        if (transformSettings.width) transforms.push(`w_${transformSettings.width}`);
        if (transformSettings.height) transforms.push(`h_${transformSettings.height}`);
        if (transformSettings.crop) transforms.push(`c_${transformSettings.crop}`);
        if (transformSettings.quality) transforms.push(`q_${transformSettings.quality}`);
        if (transformSettings.format) transforms.push(`f_${transformSettings.format}`);
        
        if (transforms.length === 0) return url;
        
        // Insert after 'upload'
        parts.splice(uploadIndex + 1, 0, transforms.join(','));
        
        // Replace file extension if format is specified
        if (transformSettings.format && transformSettings.format !== 'auto') {
            const lastPart = parts[parts.length - 1];
            const dotIndex = lastPart.lastIndexOf('.');
            if (dotIndex !== -1) {
                const nameWithoutExt = lastPart.substring(0, dotIndex);
                parts[parts.length - 1] = `${nameWithoutExt}.${transformSettings.format}`;
            }
        }
        
        urlObj.pathname = parts.join('/');
        return urlObj.toString();
    } catch {
        return url;
    }
}

// Save upload to history
async function saveToHistory(url) {
    const { uploadHistory = [], historyLimit = 100 } = await chrome.storage.local.get(['uploadHistory', 'historyLimit']);
    
    const newItem = {
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: url,
        timestamp: Date.now()
    };
    
    // Add to beginning, keep max items based on historyLimit
    uploadHistory.unshift(newItem);
    if (uploadHistory.length > historyLimit) {
        uploadHistory.splice(historyLimit);
    }
    
    await chrome.storage.local.set({ uploadHistory });
}

// Notification function using chrome.notifications API
// Using icon as data URL (works reliably in service workers)
const NOTIFICATION_ICON = 'data:image/png;base64,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';

function notify(title, message) {
    const notificationId = `notification-${Date.now()}`;
    
    chrome.notifications.create(notificationId, {
        type: 'basic',
        iconUrl: NOTIFICATION_ICON,
        title: title,
        message: message,
        priority: 2
    });
}

// Offscreen document management for clipboard operations
let creatingOffscreen;

async function setupOffscreenDocument() {
    const offscreenUrl = chrome.runtime.getURL('offscreen.html');
    
    // Check if offscreen document already exists
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [offscreenUrl]
    });

    if (existingContexts.length > 0) {
        return; // Already exists
    }

    // Create offscreen document
    if (creatingOffscreen) {
        await creatingOffscreen;
    } else {
        creatingOffscreen = chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['CLIPBOARD'],
            justification: 'Write text to clipboard'
        });
        await creatingOffscreen;
        creatingOffscreen = null;
    }
}

async function copyToClipboardViaOffscreen(text) {
    await setupOffscreenDocument();
    
    // Send message to offscreen document to copy text
    chrome.runtime.sendMessage({
        type: 'copy-to-clipboard',
        target: 'offscreen',
        data: text
    });
}
