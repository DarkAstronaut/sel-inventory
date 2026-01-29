
// State
let counts = {};
let manualChecks = {};
const STORAGE_KEY = 'inventory_counts_v1';
const CHECKS_KEY = 'inventory_checks_v1';

// DOM Elements
const container = document.getElementById('inventory-container');
const generateBtn = document.getElementById('generate-btn');
const modal = document.getElementById('preview-modal');
const closeModal = document.getElementById('close-modal');
const copyBtn = document.getElementById('copy-btn');
const messagePreview = document.getElementById('message-preview');
const toast = document.getElementById('toast');
const clearAllBtn = document.getElementById('clear-all-btn');

// Initialize
function init() {
    loadState();
    render();
    setupEventListeners();
}

// Load counts from LocalStorage
function loadState() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            counts = JSON.parse(stored);
        }
        const storedChecks = localStorage.getItem(CHECKS_KEY);
        if (storedChecks) {
            manualChecks = JSON.parse(storedChecks);
        }
    } catch (e) {
        console.error("Failed to load state", e);
        counts = {};
        manualChecks = {};
    }
}

// Save counts to LocalStorage
function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
    localStorage.setItem(CHECKS_KEY, JSON.stringify(manualChecks));
}

// Category Background Colors
const categoryColors = {
    "Walmart": "#B8E6FE",
    "OM": "#C6D2FF",
    "Sam's": "#BEDBFF",
    "RD": "#FFC9C9",
    "Online": "#D8F999",
    "Ross": "#96F7E4",
    "Desi Store": "#FFF085",
    "Braum's Icecream": "#FCCEE8",
    "Ked's Icecream": "#FFCCD3",
    "Cups & Lids": "#FE9A37",
    "Other": "#D6D3D1"
};

// Render the inventory list
function render() {
    container.innerHTML = '';

    inventoryData.forEach((categoryObj, catIdx) => {
        const categoryGroup = document.createElement('div');
        categoryGroup.className = 'category-group';

        const header = document.createElement('div');
        header.className = 'category-header';

        // Apply category specific color
        const bgColor = categoryColors[categoryObj.category] || '#EBF5FF'; // Fallback to default
        header.style.backgroundColor = bgColor;

        const titleSpan = document.createElement('span');
        titleSpan.textContent = categoryObj.category;

        const clearBtn = document.createElement('button');
        clearBtn.className = 'clear-category-btn';
        clearBtn.textContent = 'Clear';
        clearBtn.dataset.category = categoryObj.category;

        header.appendChild(titleSpan);
        header.appendChild(clearBtn);
        categoryGroup.appendChild(header);

        categoryObj.items.forEach((item, itemIdx) => {
            const itemKey = `${categoryObj.category}|${item.name}`;
            const count = counts[itemKey] || 0;
            const isChecked = manualChecks[itemKey] || false;
            const isActive = count > 0 || isChecked;

            const row = document.createElement('div');
            row.className = 'item-row';

            const activeClass = isActive ? ' is-active' : '';
            const checkBtnClass = isActive ? ' active' : '';

            row.innerHTML = `
                <div class="item-name${activeClass}">${item.name}</div>
                <div class="item-controls">
                    <button class="check-btn${checkBtnClass}" data-key="${itemKey}">✓</button>
                    <button class="qty-btn minus" data-key="${itemKey}">−</button>
                    <span class="item-count">${count}</span>
                    <button class="qty-btn plus" data-key="${itemKey}">+</button>
                </div>
            `;

            categoryGroup.appendChild(row);
        });

        container.appendChild(categoryGroup);
    });
}

// Global Event Delegation for performance & dynamic elements
function setupEventListeners() {
    // Inventory Click Handling
    // Clear All Button
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all items?')) {
                counts = {};
                manualChecks = {};
                saveState();
                render();
                showToast('All items cleared');
            }
        });
    }

    // Category Clear Button handling via delegation
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('clear-category-btn')) {
            const categoryName = e.target.dataset.category;
            if (confirm(`Clear all items in ${categoryName}?`)) {
                clearCategory(categoryName);
            }
            return;
        }

        // Check button handler
        if (e.target.classList.contains('check-btn')) {
            const key = e.target.dataset.key;
            manualChecks[key] = !manualChecks[key];

            if (!manualChecks[key]) {
                delete manualChecks[key]; // Cleanup
            }

            saveState();

            // Optimistic DOM update
            const itemRow = e.target.closest('.item-row');
            const nameEl = itemRow.querySelector('.item-name');
            const count = counts[key] || 0;
            const isActive = count > 0 || manualChecks[key];

            if (isActive) {
                e.target.classList.add('active');
                nameEl.classList.add('is-active');
            } else {
                e.target.classList.remove('active');
                nameEl.classList.remove('is-active');
            }

            // Trigger small vibration on mobile
            if (navigator.vibrate) navigator.vibrate(5);
            return;
        }

        const btn = e.target.closest('.qty-btn');
        if (!btn) return;

        // ... existing logic ...

        const key = btn.dataset.key;
        const currentVal = counts[key] || 0;

        if (btn.classList.contains('plus')) {
            counts[key] = currentVal + 1;
        } else if (btn.classList.contains('minus')) {
            counts[key] = Math.max(0, currentVal - 1);
            if (counts[key] === 0) delete counts[key]; // Cleanup
        }

        saveState();

        // Optimistic DOM update
        const itemRow = btn.closest('.item-row');
        const countSpan = itemRow.querySelector('.item-count');
        const nameEl = itemRow.querySelector('.item-name');
        const checkBtn = itemRow.querySelector('.check-btn');

        countSpan.textContent = counts[key] || 0;

        const isActive = (counts[key] || 0) > 0 || manualChecks[key];
        if (isActive) {
            nameEl.classList.add('is-active');
            checkBtn.classList.add('active');
        } else {
            nameEl.classList.remove('is-active');
            checkBtn.classList.remove('active');
        }

        // Trigger small vibration on mobile
        if (navigator.vibrate) navigator.vibrate(5);
    });

    // Generate Button
    generateBtn.addEventListener('click', generateMessage);

    // Modal Actions
    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Close modal on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Copy Button
    copyBtn.addEventListener('click', copyToClipboard);
}

function clearCategory(categoryName) {
    // Find keys that start with the category name
    const prefix = `${categoryName}|`;
    Object.keys(counts).forEach(key => {
        if (key.startsWith(prefix)) {
            delete counts[key];
        }
    });
    Object.keys(manualChecks).forEach(key => {
        if (key.startsWith(prefix)) {
            delete manualChecks[key];
        }
    });
    saveState();
    render();
    showToast(`${categoryName} cleared`);
}

function generateMessage() {
    let messageParts = [];

    inventoryData.forEach(cat => {
        let hasItems = false;
        let categoryLines = [];

        cat.items.forEach(item => {
            const key = `${cat.category}|${item.name}`;
            const count = counts[key] || 0;
            const isChecked = manualChecks[key] || false;

            if (count > 0) {
                categoryLines.push(`${item.name} - ${count}`);
                hasItems = true;
            } else if (isChecked) {
                categoryLines.push(`Need ${item.name}`);
                hasItems = true;
            }
        });

        if (hasItems) {
            messageParts.push(`*${cat.category}*`);
            messageParts.push(...categoryLines);
            messageParts.push('------------------------'); // Separator
        }
    });

    if (messageParts.length === 0) {
        messagePreview.value = "No items selected.";
    } else {
        // Remove last separator if desired, or keep it.
        // Let's keep it clean: join with newlines.
        messagePreview.value = messageParts.join('\n');
    }

    modal.classList.remove('hidden');
}

async function copyToClipboard() {
    const text = messagePreview.value;

    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers or non-secure contexts
        messagePreview.select();
        document.execCommand('copy');
        showToast('Copied to clipboard!');
    }
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2000);
}

// Run
init();
