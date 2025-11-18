// view.js - display single equipment record on a dedicated page (used for preview & printing)
(async () => {
  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  const id = getQueryParam('id');
  const root = document.getElementById('detailsRoot');

  if (!id) {
    root.innerHTML = '<p class="alert alert-error">Missing equipment id. Use `view.html?id=<id>`.</p>';
    return;
  }

  try {
    const equipment = await API.getEquipmentById(id);
    if (!equipment) {
      root.innerHTML = '<p class="alert alert-error">Equipment not found.</p>';
      return;
    }

    const specs = equipment.specs || {};

    root.innerHTML = `
      <div class="detail-grid" style="display:grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap:1rem;">
        <div class="detail-item"><strong>Type</strong><div>${equipment.type}</div></div>
        <div class="detail-item"><strong>Status</strong><div>${equipment.status}</div></div>
        <div class="detail-item"><strong>Brand</strong><div>${equipment.brand}</div></div>
        <div class="detail-item"><strong>Model</strong><div>${equipment.model}</div></div>
        <div class="detail-item"><strong>Serial Number</strong><div>${equipment.serialNumber || ''}</div></div>
        <div class="detail-item"><strong>Location</strong><div>${equipment.location || ''}</div></div>
        <div class="detail-item"><strong>Assigned To</strong><div>${equipment.assignedTo || ''}</div></div>
        <div class="detail-item"><strong>Customer ID</strong><div>${equipment.customerId || ''}</div></div>
        <div class="detail-item"><strong>Customer Phone</strong><div>${equipment.customerPhone || ''}</div></div>
      </div>
      <div style="margin-top:1rem;">
        <h3>Notes</h3>
        <p style="white-space:pre-wrap;">${equipment.notes || ''}</p>
      </div>

      ${COMPUTER_SECTION(equipment, specs)}
      ${PRINTER_SECTION(equipment, specs)}

      <div style="margin-top:1.5rem; display:flex; gap:0.75rem;">
        <button class="btn btn-primary" onclick="window.print();">Print</button>
        <a class="btn btn-secondary" href="list.html">Back</a>
      </div>
    `;
  } catch (err) {
    console.error('Failed to load equipment:', err);
    root.innerHTML = `<p class="alert alert-error">${err.message || 'Failed to load'}</p>`;
  }

  function COMPUTER_SECTION(equipment, specs) {
    if (!equipment || !equipment.type) return '';
    if (['desktop','laptop','computer'].includes(equipment.type)) {
      return `
        <div style="margin-top:1rem;">
          <h3>Computer Specs</h3>
          <div class="detail-grid" style="display:grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap:1rem;">
            <div><strong>Processor</strong><div>${specs.processor || ''}</div></div>
            <div><strong>RAM</strong><div>${specs.ram || ''}</div></div>
            <div><strong>Storage</strong><div>${specs.storage || ''}</div></div>
            <div><strong>OS</strong><div>${specs.os || ''}</div></div>
          </div>
        </div>`;
    }
    return '';
  }

  function PRINTER_SECTION(equipment, specs) {
    if (!equipment || equipment.type !== 'printer') return '';
    return `
      <div style="margin-top:1rem;">
        <h3>Printer Specs</h3>
        <div class="detail-grid" style="display:grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap:1rem;">
          <div><strong>Type</strong><div>${specs.printerType || ''}</div></div>
          <div><strong>Technology</strong><div>${specs.printTechnology || ''}</div></div>
          <div><strong>Connectivity</strong><div>${specs.connectivity || ''}</div></div>
        </div>
      </div>`;
  }
})();