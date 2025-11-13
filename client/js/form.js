// Form Handler
const translate = (key, options) => {
  if (window.I18n) {
    return I18n.t(key, options);
  }
  if (options && typeof options.fallback === 'string') {
    return options.fallback;
  }
  return key;
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('equipmentForm');
  const typeSelect = document.getElementById('type');
  const computerSpecsGroup = document.getElementById('computerSpecsGroup');
  const printerSpecsGroup = document.getElementById('printerSpecsGroup');
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const submitSpinner = document.getElementById('submitSpinner');
  const imageInput = document.getElementById('images');

  const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
  const MAX_IMAGE_COUNT = 5;

  const COMPUTER_TYPES = new Set(['desktop', 'laptop', 'computer']);

  const normalizeDateInput = (value) => {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  // Show/hide specs based on equipment type
  typeSelect.addEventListener('change', (e) => {
    const selectedType = e.target.value;
    
    if (COMPUTER_TYPES.has(selectedType)) {
      computerSpecsGroup.style.display = 'block';
      printerSpecsGroup.style.display = 'none';
    } else if (selectedType === 'printer') {
      computerSpecsGroup.style.display = 'none';
      printerSpecsGroup.style.display = 'block';
    } else {
      computerSpecsGroup.style.display = 'none';
      printerSpecsGroup.style.display = 'none';
    }
  });

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable submit button
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitSpinner.style.display = 'inline';

    try {
      // Gather form data
      const formData = new FormData(form);
      const equipmentData = {
        type: Utils.normalizeText(formData.get('type')),
        brand: Utils.normalizeText(formData.get('brand')),
        model: Utils.normalizeText(formData.get('model')),
        serialNumber: Utils.withFallback(formData.get('serialNumber')),
        status: Utils.normalizeText(formData.get('status')),
        location: Utils.withFallback(formData.get('location')),
        purchaseDate: normalizeDateInput(formData.get('purchaseDate')),
        warrantyExpiry: normalizeDateInput(formData.get('warrantyExpiry')),
        assignedTo: Utils.withFallback(formData.get('assignedTo')),
        customerId: Utils.normalizeText(formData.get('customerId')),
        customerPhone: Utils.normalizeText(formData.get('customerPhone')),
        notes: Utils.withFallback(formData.get('notes')),
      };

      const checkInDateValue = normalizeDateInput(formData.get('checkInDate'));
      if (checkInDateValue) {
        equipmentData.checkInDate = checkInDateValue;
      }

      const imageFiles = imageInput?.files ? Array.from(imageInput.files) : [];

      if (imageFiles.length > MAX_IMAGE_COUNT) {
        throw new Error('IMAGE_COUNT_EXCEEDED');
      }

      const oversized = imageFiles.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
      if (oversized) {
        throw new Error('IMAGE_TOO_LARGE');
      }

      if (imageFiles.length > 0) {
        equipmentData.imageData = await Promise.all(
          imageFiles.map((file) => Utils.fileToDataUrl(file))
        );
      }

      // Add specs based on type
      if (COMPUTER_TYPES.has(equipmentData.type)) {
        equipmentData.specs = {
          processor: Utils.withFallback(formData.get('processor')),
          ram: Utils.withFallback(formData.get('ram')),
          storage: Utils.withFallback(formData.get('storage')),
          os: Utils.withFallback(formData.get('os')),
        };
      } else if (equipmentData.type === 'printer') {
        equipmentData.specs = {
          printerType: Utils.withFallback(formData.get('printerType')),
          printTechnology: Utils.withFallback(formData.get('printTechnology')),
          connectivity: Utils.withFallback(formData.get('connectivity')),
        };
      }

      // Submit to API
      await API.addEquipment(equipmentData);

      // Show success message
  Utils.showAlert('Equipment added successfully! Redirecting...', 'success');

      // Reset form
      form.reset();
      computerSpecsGroup.style.display = 'none';
      printerSpecsGroup.style.display = 'none';

      // Redirect to list page after 2 seconds
      setTimeout(() => {
        window.location.href = 'list.html';
      }, 2000);

    } catch (error) {
      console.error('Error adding equipment:', error);
      if (error.message === 'IMAGE_TOO_LARGE') {
        Utils.showAlert(
          translate('messages.imageTooLarge', {
            fallback: 'One or more images are too large. Each file must be under 2MB.'
          }),
          'error'
        );
      } else if (error.message === 'IMAGE_COUNT_EXCEEDED') {
        Utils.showAlert(
          translate('messages.imageCountExceeded', {
            fallback: `Too many images selected. You can upload up to ${MAX_IMAGE_COUNT} files.`,
            params: { max: MAX_IMAGE_COUNT }
          }),
          'error'
        );
      } else {
        Utils.showAlert('Failed to add equipment. Please try again.', 'error');
      }
      
      // Re-enable submit button
      submitBtn.disabled = false;
      submitText.style.display = 'inline';
      submitSpinner.style.display = 'none';
    }
  });

  // Handle form reset
  form.addEventListener('reset', () => {
    computerSpecsGroup.style.display = 'none';
    printerSpecsGroup.style.display = 'none';
    document.getElementById('alertContainer').innerHTML = '';
    if (imageInput) {
      imageInput.value = '';
    }
  });

  // Sidebar buttons wiring and live summary
  const sidebarSubmit = document.getElementById('sidebarSubmit');
  const sidebarClear = document.getElementById('sidebarClear');
  const summaryType = document.getElementById('summaryType');
  const summaryBrandModel = document.getElementById('summaryBrandModel');
  const summaryStatus = document.getElementById('summaryStatus');
  const summaryAssigned = document.getElementById('summaryAssigned');

  function updateSummary() {
    if (summaryType) summaryType.textContent = (typeSelect.value && typeSelect.value !== '') ? typeSelect.options[typeSelect.selectedIndex].text : '—';
    const brandVal = document.getElementById('brand')?.value || '';
    const modelVal = document.getElementById('model')?.value || '';
    if (summaryBrandModel) summaryBrandModel.textContent = (brandVal || modelVal) ? `${brandVal} ${modelVal}`.trim() : '—';
    const statusVal = document.getElementById('status')?.value || '';
    if (summaryStatus) summaryStatus.textContent = statusVal ? statusVal : '—';
    const assignedVal = document.getElementById('assignedTo')?.value || '';
    if (summaryAssigned) summaryAssigned.textContent = assignedVal ? assignedVal : '—';
  }

  // Wire sidebar actions
  if (sidebarSubmit) {
    sidebarSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      // prefer requestSubmit when available to keep validity checks
      if (typeof form.requestSubmit === 'function') {
        form.requestSubmit();
      } else {
        // fallback: trigger click on main submit button
        submitBtn.click();
      }
    });
  }

  if (sidebarClear) {
    sidebarClear.addEventListener('click', (e) => {
      e.preventDefault();
      form.reset();
      updateSummary();
    });
  }

  // Live update summary when relevant fields change
  ['type','brand','model','status','assignedTo'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateSummary);
      el.addEventListener('change', updateSummary);
    }
  });

  // initialize summary
  updateSummary();
});
