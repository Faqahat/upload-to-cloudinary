// popup.js

let allHistory = [];
let transformSettings = null;
let displayCount = 10;

document.addEventListener('DOMContentLoaded', async () => {
    // Load transform settings once
    const { transformations } = await chrome.storage.local.get('transformations');
    transformSettings = transformations;
    
    await loadHistory();
    setupDropZone();
    setupClipboardPaste();
    
    document.getElementById('clearAll').addEventListener('click', clearAllHistory);
    document.getElementById('exportBtn').addEventListener('click', exportHistory);
});

// ===== History Management =====

async function loadHistory() {
    const { uploadHistory = [] } = await chrome.storage.local.get('uploadHistory');
    allHistory = uploadHistory;
    renderHistory(uploadHistory);
}

function renderHistory(history) {
    const listEl = document.getElementById('historyList');
    
    if (allHistory.length === 0) {
        listEl.innerHTML = '<div class="empty-state">No uploads yet<br><span style="font-size:11px;color:#bbb">Drop an image or paste from clipboard</span></div>';
        return;
    }
    
    // Sort by timestamp, newest first
    history.sort((a, b) => b.timestamp - a.timestamp);
    
    // Show only up to displayCount items
    const itemsToShow = history.slice(0, displayCount);
    const hasMore = history.length > displayCount;
    
    listEl.innerHTML = itemsToShow.map(item => {
        const transformedUrl = applyTransformations(item.url);
        return `
        <div class="history-item" data-id="${item.id}">
            <img class="thumb" src="${item.url}" alt="thumbnail" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%23f0f0f0%22 width=%2240%22 height=%2240%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23ccc%22 font-size=%2212%22>?</text></svg>'">
            <div class="item-info">
                <span class="item-url" data-url="${transformedUrl}" data-original="${item.url}" title="Click to copy${transformSettings?.enabled ? ' (with transforms)' : ''}">${truncateUrl(item.url)}</span>
                <span class="item-time" title="${formatFullDate(item.timestamp)}">${formatRelativeTime(item.timestamp)}</span>
            </div>
            <div class="item-actions">
                <button class="action-btn copy" title="Copy URL" data-url="${transformedUrl}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <button class="action-btn delete" title="Delete" data-id="${item.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `}).join('');
    
    // Add "Load More" button if there are more items
    if (hasMore) {
        listEl.innerHTML += `
            <div class="load-more-container">
                <button class="load-more-btn" id="loadMoreBtn">Load More (${history.length - displayCount} remaining)</button>
            </div>
        `;
    }
    
    // Add event listeners
    listEl.querySelectorAll('.item-url').forEach(el => {
        el.addEventListener('click', () => copyToClipboard(el.dataset.url));
    });
    
    listEl.querySelectorAll('.action-btn.copy').forEach(el => {
        el.addEventListener('click', () => copyToClipboard(el.dataset.url));
    });
    
    listEl.querySelectorAll('.action-btn.delete').forEach(el => {
        el.addEventListener('click', () => deleteItem(el.dataset.id));
    });
    
    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            displayCount += 10;
            renderHistory(allHistory);
        });
    }
}

// ===== URL Transformations =====

function applyTransformations(url) {
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

// ===== Drag & Drop =====

function setupDropZone() {
    const dropZone = document.getElementById('dropZone');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'));
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'));
    });
    
    dropZone.addEventListener('drop', handleDrop);
    dropZone.addEventListener('click', () => {
        // Create file input for clicking
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            if (e.target.files.length > 0) {
                uploadFile(e.target.files[0]);
            }
        };
        input.click();
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

// ===== Clipboard Paste =====

function setupClipboardPaste() {
    document.addEventListener('paste', async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    uploadFile(file);
                    break;
                }
            }
        }
    });
}

// ===== Upload =====

async function uploadFile(file) {
    const dropZone = document.getElementById('dropZone');
    dropZone.classList.add('uploading');
    
    try {
        const { cloudName, uploadPreset, folder } = await chrome.storage.local.get(['cloudName', 'uploadPreset', 'folder']);
        
        if (!cloudName || !uploadPreset) {
            showToast('Please configure settings first');
            chrome.runtime.openOptionsPage();
            return;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        if (folder) {
            formData.append('folder', folder);
        }
        
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || 'Upload failed');
        }
        
        const data = await response.json();
        const uploadedUrl = data.secure_url;
        
        // Save to history
        await saveToHistory(uploadedUrl);
        
        // Copy to clipboard (with transformations if enabled)
        const urlToCopy = applyTransformations(uploadedUrl);
        await copyToClipboard(urlToCopy);
        
        // Reload history
        await loadHistory();
        
        showToast('Uploaded & copied!');
        
    } catch (error) {
        showToast('Upload failed: ' + error.message);
    } finally {
        dropZone.classList.remove('uploading');
    }
}

async function saveToHistory(url) {
    const { uploadHistory = [], historyLimit = 100 } = await chrome.storage.local.get(['uploadHistory', 'historyLimit']);
    
    const newItem = {
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: url,
        timestamp: Date.now()
    };
    
    uploadHistory.unshift(newItem);
    if (uploadHistory.length > historyLimit) {
        uploadHistory.splice(historyLimit);
    }
    
    await chrome.storage.local.set({ uploadHistory });
}

// ===== Export =====

async function exportHistory() {
    if (allHistory.length === 0) {
        showToast('No history to export');
        return;
    }
    
    const exportData = {
        exported: new Date().toISOString(),
        count: allHistory.length,
        uploads: allHistory.map(item => ({
            url: item.url,
            transformedUrl: applyTransformations(item.url),
            timestamp: item.timestamp,
            date: new Date(item.timestamp).toISOString()
        }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudinary-uploads-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showToast('History exported!');
}

// ===== Utilities =====

function truncateUrl(url) {
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        if (path.length > 30) {
            return '...' + path.slice(-30);
        }
        return path;
    } catch {
        return url.slice(-35);
    }
}

function formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return formatFullDate(timestamp);
}

function formatFullDate(timestamp) {
    return new Date(timestamp).toLocaleString();
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied!');
    } catch (err) {
        showToast('Copy failed');
    }
}

function showToast(message) {
    let toast = document.querySelector('.copied-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'copied-toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 1500);
}

async function deleteItem(id) {
    const { uploadHistory = [] } = await chrome.storage.local.get('uploadHistory');
    const newHistory = uploadHistory.filter(item => item.id !== id);
    await chrome.storage.local.set({ uploadHistory: newHistory });
    allHistory = newHistory;
    displayCount = 10; // Reset display count
    renderHistory(newHistory);
}

async function clearAllHistory() {
    if (allHistory.length === 0) return;
    
    if (confirm('Clear all upload history?')) {
        await chrome.storage.local.set({ uploadHistory: [] });
        allHistory = [];
        displayCount = 10; // Reset display count
        renderHistory([]);
    }
}
