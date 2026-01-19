// options.js
document.addEventListener('DOMContentLoaded', () => {
    const cloudNameInput = document.getElementById('cloudName');
    const uploadPresetInput = document.getElementById('uploadPreset');
    const folderInput = document.getElementById('folder');
    const historyLimitInput = document.getElementById('historyLimit');
    const saveButton = document.getElementById('save');
    const statusDiv = document.getElementById('status');
    
    // Transformation inputs
    const transformEnabled = document.getElementById('transformEnabled');
    const transformWidth = document.getElementById('transformWidth');
    const transformHeight = document.getElementById('transformHeight');
    const transformQuality = document.getElementById('transformQuality');
    const transformFormat = document.getElementById('transformFormat');
    const transformCrop = document.getElementById('transformCrop');
    const transformOptions = document.getElementById('transformOptions');

    // Load saved settings
    chrome.storage.local.get(['cloudName', 'uploadPreset', 'folder', 'historyLimit', 'transformations'], (items) => {
        if (items.cloudName) cloudNameInput.value = items.cloudName;
        if (items.uploadPreset) uploadPresetInput.value = items.uploadPreset;
        if (items.folder) folderInput.value = items.folder;
        if (items.historyLimit) historyLimitInput.value = items.historyLimit;
        
        // Load transformations
        if (items.transformations) {
            transformEnabled.checked = items.transformations.enabled || false;
            transformWidth.value = items.transformations.width || '';
            transformHeight.value = items.transformations.height || '';
            transformQuality.value = items.transformations.quality || '';
            transformFormat.value = items.transformations.format || '';
            transformCrop.value = items.transformations.crop || '';
        }
        
        updateTransformVisibility();
    });
    
    // Toggle transform options visibility
    transformEnabled.addEventListener('change', updateTransformVisibility);
    
    function updateTransformVisibility() {
        transformOptions.style.opacity = transformEnabled.checked ? '1' : '0.5';
        transformOptions.style.pointerEvents = transformEnabled.checked ? 'auto' : 'none';
    }

    // Save settings
    saveButton.addEventListener('click', () => {
        const cloudName = cloudNameInput.value.trim();
        const uploadPreset = uploadPresetInput.value.trim();
        const folder = folderInput.value.trim();
        let historyLimit = parseInt(historyLimitInput.value) || 100;

        if (!cloudName || !uploadPreset) {
            showStatus('Cloud Name and Upload Preset are required.', 'error');
            return;
        }
        
        // Validate history limit
        if (historyLimit < 10) historyLimit = 10;
        if (historyLimit > 500) historyLimit = 500;
        
        // Build transformations object
        const transformations = {
            enabled: transformEnabled.checked,
            width: transformWidth.value ? parseInt(transformWidth.value) : null,
            height: transformHeight.value ? parseInt(transformHeight.value) : null,
            quality: transformQuality.value || null,
            format: transformFormat.value || null,
            crop: transformCrop.value || null
        };

        chrome.storage.local.set({
            cloudName: cloudName,
            uploadPreset: uploadPreset,
            folder: folder,
            historyLimit: historyLimit,
            transformations: transformations
        }, () => {
            showStatus('Settings saved successfully!', 'success');
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 2000);
        });
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = type === 'error' ? 'status-error' : 'status-success';
    }
});
