// List View Handler
let allEquipment = [];
let filteredEquipment = [];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_COUNT = 5;
const COMPUTER_TYPES = new Set(['desktop', 'laptop', 'computer']);
const VIEW_DETAIL_IDS = [
  'viewType',
  'viewStatus',
  'viewBrand',
  'viewModel',
  'viewSerialNumber',
  'viewLocation',
  'viewAssignedTo',
  'viewCustomerId',
  'viewCustomerPhone',
  'viewPurchaseDate',
  'viewCheckInDate',
  'viewWarrantyExpiry'
];
const COMPUTER_SPEC_IDS = ['viewProcessor', 'viewRam', 'viewStorage', 'viewOs'];
const PRINTER_SPEC_IDS = ['viewPrinterType', 'viewPrintTechnology', 'viewConnectivity'];
let currentViewedEquipment = null;

const PRINT_BOOLEAN_KEYS = [
  'includeMeta',
  'includeNotes',
  'includeComputerSpecs',
  'includePrinterSpecs',
  'includeAttachments',
  'includeFooter'
];

const PRINT_PAPER_SIZES = ['auto', 'a4', 'a5', 'letter'];

const PRINT_SETTINGS_FALLBACK = {
  includeMeta: true,
  includeNotes: true,
  includeComputerSpecs: true,
  includePrinterSpecs: true,
  includeAttachments: true,
  includeFooter: true,
  paperSize: 'auto'
};

// When true, the view modal will automatically open the Images page if attachments exist
const VIEW_AUTO_OPEN_IMAGES = true;

// current view page inside modal ('details'|'images')
let currentViewModalPage = 'details';

let paperSizeControl = null;

const escapeHtml = (value) => {
  if (value == null) {
    return '';
  }
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const translate = (key, options) => {
  if (window.I18n) {
    return I18n.t(key, options);
  }
  if (options && typeof options.fallback === 'string') {
    return options.fallback;
  }
  return key;
};

const toDateInputValue = (value) => {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    if (value.length >= 10) {
      return value.slice(0, 10);
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
};

const normalizeDateInput = (value) => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const setDetailValue = (id, value) => {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }
  element.textContent = Utils.withFallback(value);
};

const resetSpecSection = (sectionId, fieldIds) => {
  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = 'none';
  }
  fieldIds.forEach((fieldId) => setDetailValue(fieldId, ''));
};

const resetViewDetails = () => {
  VIEW_DETAIL_IDS.forEach((id) => setDetailValue(id, ''));
  setDetailValue('viewNotes', '');
  resetSpecSection('viewComputerSpecsSection', COMPUTER_SPEC_IDS);
  resetSpecSection('viewPrinterSpecsSection', PRINTER_SPEC_IDS);
};

const resolvePrintSettings = () => {
  const manager = window.PrintSettingsManager;
  if (manager && typeof manager.getSettings === 'function') {
    try {
      const settings = manager.getSettings();
      return sanitizePrintSettings(settings);
    } catch (error) {
      console.error('Failed to load saved print settings', error);
    }
  }
  if (manager && typeof manager.getDefaults === 'function') {
    try {
      const defaults = manager.getDefaults();
      return sanitizePrintSettings(defaults);
    } catch (error) {
      /* fall through */
    }
  }
  return { ...PRINT_SETTINGS_FALLBACK };
};

const sanitizePrintSettings = (raw) => {
  const next = { ...PRINT_SETTINGS_FALLBACK };
  if (raw && typeof raw === 'object') {
    PRINT_BOOLEAN_KEYS.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(raw, key)) {
        next[key] = Boolean(raw[key]);
      }
    });
    if (Object.prototype.hasOwnProperty.call(raw, 'paperSize')) {
      const value = typeof raw.paperSize === 'string' ? raw.paperSize.toLowerCase() : '';
      next.paperSize = PRINT_PAPER_SIZES.includes(value) ? value : PRINT_SETTINGS_FALLBACK.paperSize;
    }
  }
  return next;
};

const buildPageSizeCss = (size) => {
  if (!size) {
    return '';
  }
  const normalized = size.toLowerCase();
  if (normalized === 'auto') {
    return '';
  }
  if (normalized === 'a4') {
    return '@page { size: A4; margin: 20mm; }\n';
  }
  if (normalized === 'a5') {
    return '@page { size: A5; margin: 15mm; }\n';
  }
  if (normalized === 'letter') {
    return '@page { size: Letter; margin: 0.75in; }\n';
  }
  return '';
};

function initializePaperSizeControl() {
  paperSizeControl = document.getElementById('printPaperSize');
  if (!paperSizeControl) {
    return;
  }
  syncPaperSizeControl();
  paperSizeControl.addEventListener('change', handlePaperSizeChange);
}

function syncPaperSizeControl() {
  if (!paperSizeControl) {
    return;
  }
  const settings = resolvePrintSettings();
  const value = PRINT_PAPER_SIZES.includes(settings.paperSize) ? settings.paperSize : PRINT_SETTINGS_FALLBACK.paperSize;
  paperSizeControl.value = value;
}

function handlePaperSizeChange() {
  if (!paperSizeControl) {
    return;
  }
  const rawValue = typeof paperSizeControl.value === 'string' ? paperSizeControl.value.toLowerCase() : '';
  const value = PRINT_PAPER_SIZES.includes(rawValue) ? rawValue : PRINT_SETTINGS_FALLBACK.paperSize;
  if (!PRINT_PAPER_SIZES.includes(rawValue)) {
    paperSizeControl.value = PRINT_SETTINGS_FALLBACK.paperSize;
  }

  const manager = window.PrintSettingsManager;
  if (manager && typeof manager.save === 'function') {
    try {
      const current = resolvePrintSettings();
      current.paperSize = value;
      manager.save(current);
    } catch (error) {
      console.error('Failed to persist paper size preference', error);
    }
  }
}

function handlePrintButtonClick() {
  const overrides = {};
  if (paperSizeControl) {
    const rawValue = typeof paperSizeControl.value === 'string' ? paperSizeControl.value.toLowerCase() : '';
    if (PRINT_PAPER_SIZES.includes(rawValue)) {
      overrides.paperSize = rawValue;
    }
  }
  const hasOverrides = Object.keys(overrides).length > 0;
  printViewedEquipment(hasOverrides ? overrides : undefined);
}

document.addEventListener('DOMContentLoaded', () => {
  loadEquipment();

  // Set up filters
  const searchInput = document.getElementById('searchInput');
  const phoneFilter = document.getElementById('phoneFilter');
  const startDateFilter = document.getElementById('startDateFilter');
  const endDateFilter = document.getElementById('endDateFilter');
  const typeFilter = document.getElementById('typeFilter');
  const statusFilter = document.getElementById('statusFilter');
  const exportButton = document.getElementById('exportButton');

  if (searchInput) {
    searchInput.addEventListener('input', filterEquipment);
  }
  if (phoneFilter) {
    phoneFilter.addEventListener('input', filterEquipment);
  }
  if (startDateFilter) {
    startDateFilter.addEventListener('change', filterEquipment);
  }
  if (endDateFilter) {
    endDateFilter.addEventListener('change', filterEquipment);
  }
  if (typeFilter) {
    typeFilter.addEventListener('change', filterEquipment);
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', filterEquipment);
  }
  if (exportButton) {
    exportButton.addEventListener('click', exportFilteredEquipment);
  }

  initializePaperSizeControl();

  // Wire view modal tab buttons (if present)
  const viewTabDetails = document.getElementById('viewTabDetails');
  const viewTabImages = document.getElementById('viewTabImages');
  if (viewTabDetails) {
    viewTabDetails.addEventListener('click', () => showViewPage('details'));
  }
  if (viewTabImages) {
    viewTabImages.addEventListener('click', () => showViewPage('images'));
  }
  // Wire next/back buttons
  const viewNextBtn = document.getElementById('viewNextBtn');
  const viewBackBtn = document.getElementById('viewBackBtn');
  if (viewNextBtn) {
    viewNextBtn.addEventListener('click', () => {
      if (currentViewModalPage === 'details') showViewPage('images');
    });
  }
  if (viewBackBtn) {
    viewBackBtn.addEventListener('click', () => {
      if (currentViewModalPage === 'images') showViewPage('details');
    });
  }

  if (window.I18n) {
    I18n.onChange(() => {
      renderTable();
    });
  }
});

// Load equipment from API
async function loadEquipment() {
  try {
    allEquipment = await API.getEquipment();
    filteredEquipment = [...allEquipment];
    renderTable();
  } catch (error) {
    console.error('Error loading equipment:', error);
    document.getElementById('tableContainer').innerHTML = `
      <p class="alert alert-error">${translate('list.error.loadEquipment', {
        fallback: 'Failed to load equipment. Please make sure the server is running.'
      })}</p>`;
  }
}

// Filter equipment based on search and filters
function filterEquipment() {
  const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const phoneFilterRaw = document.getElementById('phoneFilter')?.value || '';
  const phoneFilterDigits = phoneFilterRaw.replace(/\D+/g, '');
  const startDateValue = document.getElementById('startDateFilter')?.value || '';
  const endDateValue = document.getElementById('endDateFilter')?.value || '';
  const typeFilterValue = document.getElementById('typeFilter')?.value || '';
  const statusFilterValue = document.getElementById('statusFilter')?.value || '';

  filteredEquipment = allEquipment.filter(item => {
    const brandText = (item.brand || '').toLowerCase();
    const modelText = (item.model || '').toLowerCase();
    const serialText = (item.serialNumber || '').toLowerCase();
    const locationText = (item.location || '').toLowerCase();
    const assignedToText = (item.assignedTo || '').toLowerCase();
    const customerIdText = (item.customerId || '').toLowerCase();
    const customerPhoneText = (item.customerPhone || '').toLowerCase();

    const matchesSearch =
      (!searchTerm || brandText.includes(searchTerm)) ||
      modelText.includes(searchTerm) ||
      serialText.includes(searchTerm) ||
      locationText.includes(searchTerm) ||
      assignedToText.includes(searchTerm) ||
      customerIdText.includes(searchTerm) ||
      customerPhoneText.includes(searchTerm);

    const normalizedPhone = (item.customerPhone || '').replace(/\D+/g, '');
    const matchesPhone = !phoneFilterDigits || normalizedPhone.includes(phoneFilterDigits);

    const sourceDate = item.checkInDate || item.createdAt;
    const itemDate = toDateInputValue(sourceDate);
    const matchesStartDate = !startDateValue || (itemDate && itemDate >= startDateValue);
    const matchesEndDate = !endDateValue || (itemDate && itemDate <= endDateValue);

    const matchesType = !typeFilterValue || item.type === typeFilterValue;
    const matchesStatus = !statusFilterValue || item.status === statusFilterValue;

    return matchesSearch && matchesPhone && matchesStartDate && matchesEndDate && matchesType && matchesStatus;
  });

  renderTable();
}

function exportFilteredEquipment() {
  if (!Array.isArray(filteredEquipment) || filteredEquipment.length === 0) {
    Utils.showAlert(translate('list.export.noData', { fallback: 'No data to export.' }), 'info');
    return;
  }

  const headers = [
    translate('common.labels.type', { fallback: 'Type' }),
    translate('common.labels.brand', { fallback: 'Brand' }),
    translate('common.labels.model', { fallback: 'Model' }),
    translate('common.labels.serialNumber', { fallback: 'Serial Number' }),
    translate('common.labels.location', { fallback: 'Location' }),
    translate('common.labels.assignedTo', { fallback: 'Assigned To' }),
    translate('common.labels.customerId', { fallback: 'Customer ID' }),
    translate('common.labels.customerPhone', { fallback: 'Customer Phone' }),
  translate('common.labels.dateAdded', { fallback: 'Date Check-in' }),
    translate('common.labels.status', { fallback: 'Status' })
  ];

  const rows = filteredEquipment.map((item) => ([
    translate(`types.${item.type}`, { fallback: item.type }),
    item.brand,
    item.model,
    Utils.withFallback(item.serialNumber, ''),
    Utils.withFallback(item.location, ''),
    Utils.withFallback(item.assignedTo, ''),
    Utils.withFallback(item.customerId, ''),
    Utils.withFallback(item.customerPhone, ''),
  Utils.formatDate(item.checkInDate || item.createdAt),
    translate(`status.${item.status}`, { fallback: item.status })
  ]));

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeForCsv).join(','))
    .join('\r\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `equipment-export-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  Utils.showAlert(translate('list.export.success', { fallback: 'Export started. Check your downloads.' }), 'success');
}

function escapeForCsv(value) {
  if (value == null) {
    return '';
  }
  const stringValue = String(value).replace(/\r?\n|\r/g, ' ');
  if (/[",]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

// Render equipment table
function renderTable() {
  const container = document.getElementById('tableContainer');
  if (!container) {
    return;
  }

  if (filteredEquipment.length === 0) {
    const messageKey = allEquipment.length === 0 ? 'list.emptyMessageHtml' : 'list.filterNoResults';
    const fallbackMessage = allEquipment.length === 0
      ? 'No equipment found. <a href="form.html">Add your first entry</a>'
      : 'No equipment matches your filters.';

    container.innerHTML = `
      <p style="text-align: center; padding: 2rem; color: var(--text-secondary);">
        ${translate(messageKey, { fallback: fallbackMessage })}
      </p>
    `;
    return;
  }

  const tableHTML = `
    <table>
      <thead>
        <tr>
          <th>${translate('common.labels.type', { fallback: 'Type' })}</th>
          <th>${translate('common.labels.brand', { fallback: 'Brand' })}</th>
          <th>${translate('common.labels.model', { fallback: 'Model' })}</th>
          <th>${translate('common.labels.serialNumber', { fallback: 'Serial Number' })}</th>
          <th>${translate('common.labels.location', { fallback: 'Location' })}</th>
          <th>${translate('common.labels.assignedTo', { fallback: 'Assigned To' })}</th>
          <th>${translate('common.labels.customerId', { fallback: 'Customer ID' })}</th>
          <th>${translate('common.labels.customerPhone', { fallback: 'Customer Phone' })}</th>
          <th>${translate('common.labels.dateAdded', { fallback: 'Date Check-in' })}</th>
          <th>${translate('common.labels.status', { fallback: 'Status' })}</th>
          <th>${translate('common.labels.actions', { fallback: 'Actions' })}</th>
        </tr>
      </thead>
      <tbody>
        ${filteredEquipment.map(item => `
          <tr>
            <td><span class="badge badge-info">${translate(`types.${item.type}`, { fallback: item.type })}</span></td>
            <td>${item.brand}</td>
            <td>${item.model}</td>
            <td>${Utils.withFallback(item.serialNumber)}</td>
            <td>${Utils.withFallback(item.location)}</td>
            <td>${Utils.withFallback(item.assignedTo)}</td>
            <td>${Utils.withFallback(item.customerId)}</td>
            <td>${Utils.withFallback(item.customerPhone)}</td>
            <td>${Utils.formatDate(item.checkInDate || item.createdAt)}</td>
            <td><span class="badge ${Utils.getStatusBadgeClass(item.status)}">${translate(`status.${item.status}`, { fallback: item.status })}</span></td>
            <td>
              <div class="action-buttons">
                <button class="btn btn-secondary btn-sm" onclick="viewEquipment('${item._id}')">${translate('buttons.view', { fallback: 'View' })}</button>
                <button class="btn btn-primary btn-sm" onclick="editEquipment('${item._id}')">${translate('buttons.edit', { fallback: 'Edit' })}</button>
                <button class="btn btn-danger btn-sm" onclick="deleteEquipment('${item._id}')">${translate('buttons.delete', { fallback: 'Delete' })}</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = tableHTML;
}

// Edit equipment
async function editEquipment(id) {
  try {
    const equipment = await API.getEquipmentById(id);
    
    // Populate edit form
    document.getElementById('editId').value = equipment._id;
    document.getElementById('editType').value = equipment.type;
    document.getElementById('editBrand').value = equipment.brand;
    document.getElementById('editModel').value = equipment.model;
    document.getElementById('editSerialNumber').value = equipment.serialNumber || '';
    document.getElementById('editStatus').value = equipment.status;
    document.getElementById('editLocation').value = equipment.location || '';
    document.getElementById('editAssignedTo').value = equipment.assignedTo || '';
    document.getElementById('editCustomerId').value = equipment.customerId || '';
    document.getElementById('editCustomerPhone').value = equipment.customerPhone || '';
    const notesField = document.getElementById('editNotes');
    if (notesField) {
      notesField.value = equipment.notes || '';
    }

    const checkInDateField = document.getElementById('editCheckInDate');
    if (checkInDateField) {
      checkInDateField.value = toDateInputValue(equipment.checkInDate || equipment.createdAt);
    }

    const imageInput = document.getElementById('editImages');
    if (imageInput) {
      imageInput.value = '';
    }

    // Show modal
    document.getElementById('editModal').style.display = 'block';
  } catch (error) {
    console.error('Error loading equipment:', error);
    Utils.showAlert(translate('list.error.loadEquipmentDetails', { fallback: 'Failed to load equipment details.' }), 'error');
  }
}

// Close edit modal
function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
  document.getElementById('editForm').reset();

  const imageInput = document.getElementById('editImages');
  if (imageInput) {
    imageInput.value = '';
  }
}

// Handle edit form submission
document.addEventListener('DOMContentLoaded', () => {
  const editForm = document.getElementById('editForm');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('editId').value;
      const checkInDateValueRaw = document.getElementById('editCheckInDate')?.value || '';

      const updatedData = {
        type: Utils.normalizeText(document.getElementById('editType').value),
        brand: Utils.normalizeText(document.getElementById('editBrand').value),
        model: Utils.normalizeText(document.getElementById('editModel').value),
        serialNumber: Utils.withFallback(document.getElementById('editSerialNumber').value),
        status: Utils.normalizeText(document.getElementById('editStatus').value),
        location: Utils.withFallback(document.getElementById('editLocation').value),
        assignedTo: Utils.withFallback(document.getElementById('editAssignedTo').value),
        customerId: Utils.normalizeText(document.getElementById('editCustomerId').value),
        customerPhone: Utils.normalizeText(document.getElementById('editCustomerPhone').value)
      };

      // Include notes
      const notesValue = document.getElementById('editNotes') ? document.getElementById('editNotes').value : '';
      updatedData.notes = Utils.withFallback(notesValue);

      const normalizedCheckInDate = normalizeDateInput(checkInDateValueRaw);
      if (normalizedCheckInDate) {
        updatedData.checkInDate = normalizedCheckInDate;
      } else if (checkInDateValueRaw.trim().length === 0) {
        updatedData.checkInDate = null;
      }

      const imageInput = document.getElementById('editImages');
      const imageFiles = imageInput?.files ? Array.from(imageInput.files) : [];

      if (imageFiles.length > MAX_IMAGE_COUNT) {
        Utils.showAlert(
          translate('messages.imageCountExceeded', {
            fallback: `Too many images selected. You can upload up to ${MAX_IMAGE_COUNT} files.`,
            params: { max: MAX_IMAGE_COUNT }
          }),
          'error'
        );
        return;
      }

      const oversized = imageFiles.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
      if (oversized) {
        Utils.showAlert(
          translate('messages.imageTooLarge', {
            fallback: 'One or more images are too large. Each file must be under 2MB.'
          }),
          'error'
        );
        return;
      }

      if (imageFiles.length > 0) {
        try {
          updatedData.imageData = await Promise.all(
            imageFiles.map((file) => Utils.fileToDataUrl(file))
          );
        } catch (fileError) {
          console.error('Error reading attachment:', fileError);
          Utils.showAlert(
            translate('messages.imageReadError', {
              fallback: 'Failed to process the attachment. Please try again.'
            }),
            'error'
          );
          return;
        }
      }

      try {
        await API.updateEquipment(id, updatedData);
        Utils.showAlert(translate('messages.updateSuccess', { fallback: 'Equipment updated successfully!' }), 'success');
        closeEditModal();
        loadEquipment(); // Reload the list
      } catch (error) {
        console.error('Error updating equipment:', error);
        Utils.showAlert(translate('messages.updateError', { fallback: 'Failed to update equipment.' }), 'error');
      }
    });
  }
});

// Delete equipment
async function deleteEquipment(id) {
  if (!Utils.confirm(translate('list.confirm.delete', { fallback: 'Are you sure you want to delete this equipment?' }))) {
    return;
  }

  try {
    await API.deleteEquipment(id);
    Utils.showAlert(translate('messages.deleteSuccess', { fallback: 'Equipment deleted successfully!' }), 'success');
    loadEquipment(); // Reload the list
  } catch (error) {
    console.error('Error deleting equipment:', error);
    Utils.showAlert(translate('messages.deleteError', { fallback: 'Failed to delete equipment.' }), 'error');
  }
}

// Show equipment image in a modal if data exists
async function viewEquipment(id) {
  try {
    const equipment = await API.getEquipmentById(id);
    const galleryElement = document.getElementById('viewImageGallery');
    const messageElement = document.getElementById('viewImageMessage');

    resetViewDetails();
    currentViewedEquipment = equipment;

    const detailsToUpdate = [
      ['viewType', translate(`types.${equipment.type}`, { fallback: Utils.withFallback(equipment.type) })],
      ['viewStatus', translate(`status.${equipment.status}`, { fallback: Utils.withFallback(equipment.status) })],
      ['viewBrand', equipment.brand],
      ['viewModel', equipment.model],
      ['viewSerialNumber', equipment.serialNumber],
      ['viewLocation', equipment.location],
      ['viewAssignedTo', equipment.assignedTo],
      ['viewCustomerId', equipment.customerId],
      ['viewCustomerPhone', equipment.customerPhone],
      ['viewPurchaseDate', Utils.formatDate(equipment.purchaseDate)],
      ['viewCheckInDate', Utils.formatDate(equipment.checkInDate || equipment.createdAt)],
      ['viewWarrantyExpiry', Utils.formatDate(equipment.warrantyExpiry)]
    ];

    detailsToUpdate.forEach(([fieldId, value]) => setDetailValue(fieldId, value));

    const notesElement = document.getElementById('viewNotes');
    if (notesElement) {
      notesElement.textContent = Utils.withFallback(equipment.notes);
    }

    const specs = equipment && equipment.specs ? equipment.specs : {};

    const computerSection = document.getElementById('viewComputerSpecsSection');
    if (computerSection) {
      if (COMPUTER_TYPES.has(equipment.type)) {
        computerSection.style.display = 'block';
        setDetailValue('viewProcessor', specs.processor);
        setDetailValue('viewRam', specs.ram);
        setDetailValue('viewStorage', specs.storage);
        setDetailValue('viewOs', specs.os);
      } else {
        resetSpecSection('viewComputerSpecsSection', COMPUTER_SPEC_IDS);
      }
    }

    const printerSection = document.getElementById('viewPrinterSpecsSection');
    if (printerSection) {
      if (equipment.type === 'printer') {
        printerSection.style.display = 'block';
        setDetailValue('viewPrinterType', specs.printerType);
        setDetailValue('viewPrintTechnology', specs.printTechnology);
        setDetailValue('viewConnectivity', specs.connectivity);
      } else {
        resetSpecSection('viewPrinterSpecsSection', PRINTER_SPEC_IDS);
      }
    }

    if (galleryElement) {
      galleryElement.innerHTML = '';
    }

    const attachments = Array.isArray(equipment.imageData)
      ? equipment.imageData.filter(Boolean)
      : equipment.imageData
        ? [equipment.imageData]
        : [];

  if (attachments.length > 0 && galleryElement) {
      attachments.forEach((src, index) => {
        const link = document.createElement('a');
        link.href = src;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const attachmentLabel = translate('list.viewModal.imageAlt', {
          fallback: `Attachment ${index + 1}`,
          params: { count: index + 1 }
        });

        link.setAttribute('aria-label', attachmentLabel);
        link.setAttribute('title', attachmentLabel);

        const img = document.createElement('img');
        img.src = src;
        img.alt = attachmentLabel;
        img.loading = 'lazy';

        link.appendChild(img);
        galleryElement.appendChild(link);
      });

      galleryElement.style.display = 'flex';
      if (messageElement) {
        messageElement.style.display = 'none';
      }
    } else {
      if (galleryElement) {
        galleryElement.style.display = 'none';
      }
      if (messageElement) {
        messageElement.style.display = 'block';
      }
    }

    // Auto-open the images page if attachments exist and the feature is enabled
    try {
      if (attachments.length > 0 && VIEW_AUTO_OPEN_IMAGES) {
        showViewPage('images');
      } else {
        showViewPage('details');
      }
    } catch (e) { /* ignore if paging not present */ }
    syncPaperSizeControl();
    document.getElementById('viewModal').style.display = 'block';
  } catch (error) {
    console.error('Error loading equipment image:', error);
    currentViewedEquipment = null;
    Utils.showAlert(translate('list.error.loadEquipmentDetails', { fallback: 'Failed to load equipment details.' }), 'error');
  }
}

function closeViewModal() {
  const modal = document.getElementById('viewModal');
  const galleryElement = document.getElementById('viewImageGallery');
  const messageElement = document.getElementById('viewImageMessage');

  resetViewDetails();
  currentViewedEquipment = null;

  if (modal) {
    modal.style.display = 'none';
  }

  if (galleryElement) {
    galleryElement.innerHTML = '';
    galleryElement.style.display = 'none';
  }

  if (messageElement) {
    messageElement.style.display = 'block';
  }
}

// Switch between pages inside the view modal (details / images)
function showViewPage(page) {
  const detailsPage = document.getElementById('viewPageDetails');
  const imagesPage = document.getElementById('viewPageImages');
  const tabDetails = document.getElementById('viewTabDetails');
  const tabImages = document.getElementById('viewTabImages');
  const nextBtn = document.getElementById('viewNextBtn');
  const backBtn = document.getElementById('viewBackBtn');
  if (!detailsPage || !imagesPage) return;
  if (page === 'images') {
    detailsPage.style.display = 'none';
    imagesPage.style.display = 'block';
    detailsPage.setAttribute('aria-hidden', 'true');
    imagesPage.setAttribute('aria-hidden', 'false');
    if (tabDetails) {
      tabDetails.classList.remove('active');
      tabDetails.setAttribute('aria-selected', 'false');
      tabDetails.setAttribute('tabindex', '-1');
    }
    if (tabImages) {
      tabImages.classList.add('active');
      tabImages.setAttribute('aria-selected', 'true');
      tabImages.setAttribute('tabindex', '0');
    }
    if (nextBtn) nextBtn.disabled = true;
    if (backBtn) backBtn.disabled = false;
    currentViewModalPage = 'images';
  } else {
    detailsPage.style.display = 'block';
    imagesPage.style.display = 'none';
    detailsPage.setAttribute('aria-hidden', 'false');
    imagesPage.setAttribute('aria-hidden', 'true');
    if (tabDetails) {
      tabDetails.classList.add('active');
      tabDetails.setAttribute('aria-selected', 'true');
      tabDetails.setAttribute('tabindex', '0');
    }
    if (tabImages) {
      tabImages.classList.remove('active');
      tabImages.setAttribute('aria-selected', 'false');
      tabImages.setAttribute('tabindex', '-1');
    }
    if (nextBtn) nextBtn.disabled = false;
    if (backBtn) backBtn.disabled = true;
    currentViewModalPage = 'details';
  }
}

function printViewedEquipment(overrideSettings) {
  if (!currentViewedEquipment) {
    Utils.showAlert(
      translate('list.viewModal.printUnavailable', { fallback: 'Open an equipment record before printing.' }),
      'info'
    );
    return;
  }

  const locale = window.I18n && typeof I18n.getLanguage === 'function' && I18n.getLanguage() === 'kh' ? 'km-KH' : 'en-US';
  const equipment = currentViewedEquipment;
  const specs = equipment.specs || {};

  const baseSettings = resolvePrintSettings();
  let effectiveSettings = baseSettings;

  if (overrideSettings && typeof overrideSettings === 'object') {
    const sanitizedOverride = {};
    PRINT_BOOLEAN_KEYS.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(overrideSettings, key)) {
        sanitizedOverride[key] = Boolean(overrideSettings[key]);
      }
    });
    if (Object.prototype.hasOwnProperty.call(overrideSettings, 'paperSize')) {
      const overrideValue = typeof overrideSettings.paperSize === 'string' ? overrideSettings.paperSize.toLowerCase() : '';
      if (PRINT_PAPER_SIZES.includes(overrideValue)) {
        sanitizedOverride.paperSize = overrideValue;
      }
    }
    effectiveSettings = { ...baseSettings, ...sanitizedOverride };
  }

  const {
    includeMeta,
    includeNotes,
    includeComputerSpecs,
    includePrinterSpecs,
    includeAttachments,
    includeFooter,
    paperSize
  } = effectiveSettings;

  const details = [
    {
      label: translate('common.labels.type', { fallback: 'Type' }),
      value: translate(`types.${equipment.type}`, { fallback: Utils.withFallback(equipment.type) })
    },
    {
      label: translate('common.labels.status', { fallback: 'Status' }),
      value: translate(`status.${equipment.status}`, { fallback: Utils.withFallback(equipment.status) })
    },
    { label: translate('common.labels.brand', { fallback: 'Brand' }), value: Utils.withFallback(equipment.brand) },
    { label: translate('common.labels.model', { fallback: 'Model' }), value: Utils.withFallback(equipment.model) },
    { label: translate('common.labels.serialNumber', { fallback: 'Serial number' }), value: Utils.withFallback(equipment.serialNumber) },
    { label: translate('common.labels.location', { fallback: 'Location' }), value: Utils.withFallback(equipment.location) },
    { label: translate('common.labels.assignedTo', { fallback: 'Assigned to' }), value: Utils.withFallback(equipment.assignedTo) },
    { label: translate('common.labels.customerId', { fallback: 'Customer ID' }), value: Utils.withFallback(equipment.customerId) },
    { label: translate('common.labels.customerPhone', { fallback: 'Customer phone' }), value: Utils.withFallback(equipment.customerPhone) },
    { label: translate('form.fields.purchaseDate', { fallback: 'Purchase date' }), value: Utils.formatDate(equipment.purchaseDate) },
    { label: translate('form.fields.checkInDate', { fallback: 'Date check-in' }), value: Utils.formatDate(equipment.checkInDate || equipment.createdAt) },
    { label: translate('form.fields.warrantyExpiry', { fallback: 'Warranty expiry' }), value: Utils.formatDate(equipment.warrantyExpiry) }
  ];

  const detailHtml = details.map(({ label, value }) => `
      <div class="detail">
        <span class="detail-label">${escapeHtml(label)}</span>
        <span class="detail-value">${escapeHtml(value)}</span>
      </div>
    `).join('');

  const notesLabel = translate('form.fields.notes', { fallback: 'Notes' });
  const notesValue = escapeHtml(Utils.withFallback(equipment.notes));

  const notesSectionHtml = includeNotes
    ? `
        <section>
          <h2>${escapeHtml(notesLabel)}</h2>
          <div class="notes">${notesValue}</div>
        </section>
      `
    : '';

  const computerSpecSectionHtml = includeComputerSpecs && COMPUTER_TYPES.has(equipment.type)
    ? (() => {
        const fields = [
          { label: translate('form.fields.processor', { fallback: 'Processor' }), value: Utils.withFallback(specs.processor) },
          { label: translate('form.fields.ram', { fallback: 'RAM' }), value: Utils.withFallback(specs.ram) },
          { label: translate('form.fields.storage', { fallback: 'Storage' }), value: Utils.withFallback(specs.storage) },
          { label: translate('form.fields.os', { fallback: 'Operating system' }), value: Utils.withFallback(specs.os) }
        ];

        const rows = fields.map(({ label, value }) => `
            <div class="detail">
              <span class="detail-label">${escapeHtml(label)}</span>
              <span class="detail-value">${escapeHtml(value)}</span>
            </div>
          `).join('');

        return `
          <section>
            <h2>${escapeHtml(translate('form.computerSpecsTitle', { fallback: 'Computer specifications' }))}</h2>
            <div class="detail-grid">${rows}</div>
          </section>
        `;
      })()
    : '';

  const printerSpecSectionHtml = includePrinterSpecs && equipment.type === 'printer'
    ? (() => {
        const fields = [
          { label: translate('form.fields.printerType', { fallback: 'Printer type' }), value: Utils.withFallback(specs.printerType) },
          { label: translate('form.fields.printTechnology', { fallback: 'Print technology' }), value: Utils.withFallback(specs.printTechnology) },
          { label: translate('form.fields.connectivity', { fallback: 'Connectivity' }), value: Utils.withFallback(specs.connectivity) }
        ];

        const rows = fields.map(({ label, value }) => `
            <div class="detail">
              <span class="detail-label">${escapeHtml(label)}</span>
              <span class="detail-value">${escapeHtml(value)}</span>
            </div>
          `).join('');

        return `
          <section>
            <h2>${escapeHtml(translate('form.printerSpecsTitle', { fallback: 'Printer specifications' }))}</h2>
            <div class="detail-grid">${rows}</div>
          </section>
        `;
      })()
    : '';

  const attachments = Array.isArray(equipment.imageData)
    ? equipment.imageData.filter(Boolean)
    : equipment.imageData
      ? [equipment.imageData]
      : [];
  const safeAttachments = attachments.filter((src) => typeof src === 'string' && src.startsWith('data:'));

  const attachmentHeading = translate('list.viewModal.title', { fallback: 'Equipment images' });
  const noImageText = translate('list.viewModal.noImage', { fallback: 'No images attached for this item.' });
  const attachmentsHtml = safeAttachments.length > 0
    ? `<div class="image-grid">${safeAttachments.map((src, index) => {
      const attachmentLabel = translate('list.viewModal.imageAlt', {
        fallback: `Attachment ${index + 1}`,
        params: { count: index + 1 }
      });
      return `
          <figure>
            <img src="${src}" alt="${escapeHtml(attachmentLabel)}" />
            <figcaption>${escapeHtml(attachmentLabel)}</figcaption>
          </figure>
        `;
    }).join('')}</div>`
    : `<p class="muted">${escapeHtml(noImageText)}</p>`;

  const attachmentsSectionHtml = includeAttachments
    ? `
        <section>
          <h2>${escapeHtml(attachmentHeading)}</h2>
          ${attachmentsHtml}
        </section>
      `
    : '';

  const generatedOnLabel = translate('list.viewModal.printGenerated', { fallback: 'Generated on' });
  const generatedOnValue = escapeHtml(new Date().toLocaleString(locale));
  const summaryHeading = escapeHtml(translate('list.viewModal.printHeading', { fallback: 'Equipment Summary' }));

  const metaHtml = includeMeta
    ? `<div class="meta">${escapeHtml(generatedOnLabel)}: ${generatedOnValue}</div>`
    : '';

  const footerHtml = includeFooter ? `<footer>${escapeHtml(document.location.href)}</footer>` : '';

  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=650');
  if (!printWindow) {
    Utils.showAlert(
      translate('list.viewModal.printBlocked', { fallback: 'Unable to open print view. Please allow pop-ups and try again.' }),
      'error'
    );
    return;
  }

  const pageSizeCss = buildPageSizeCss(paperSize);

  const styles = `
    ${pageSizeCss}
    body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 24px; color: #0f172a; }
    h1 { margin-top: 0; font-size: 1.75rem; }
    h2 { margin: 24px 0 12px; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
    .meta { color: #64748b; font-size: 0.9rem; margin-bottom: 16px; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .detail { border: 1px solid #cbd5f5; border-radius: 6px; padding: 12px; background: #f8fafc; }
    .detail-label { display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 6px; }
    .detail-value { font-weight: 600; font-size: 0.95rem; color: #0f172a; }
    .notes { border: 1px solid #cbd5f5; border-radius: 6px; padding: 16px; background: #fff; white-space: pre-wrap; min-height: 80px; }
    .image-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    figure { margin: 0; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; background: #fff; }
    img { width: 100%; height: auto; display: block; }
    figcaption { padding: 8px; font-size: 0.85rem; color: #475569; text-align: center; background: #f1f5f9; }
    .muted { color: #64748b; font-style: italic; }
    footer { margin-top: 32px; font-size: 0.8rem; color: #94a3b8; text-align: right; }
    @media print {
      body { padding: 0 24px; }
      button { display: none; }
    }
  `;

  const documentTitle = `${translate('list.viewModal.print', { fallback: 'Print' })} - ${translate('common.labels.type', { fallback: 'Type' })}: ${translate(`types.${equipment.type}`, { fallback: Utils.withFallback(equipment.type) })}`;

  printWindow.document.write(`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(documentTitle)}</title>
        <style>${styles}</style>
      </head>
      <body>
        <header>
          <h1>${summaryHeading}</h1>
          ${metaHtml}
        </header>
        <section>
          <h2>${escapeHtml(translate('common.labels.details', { fallback: 'Details' }))}</h2>
          <div class="detail-grid">${detailHtml}</div>
        </section>
        ${notesSectionHtml}
        ${computerSpecSectionHtml}
        ${printerSpecSectionHtml}
        ${attachmentsSectionHtml}
        ${footerHtml}
      </body>
    </html>`);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 200);
}
