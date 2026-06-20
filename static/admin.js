/* ════════════════════════════════════════════════════════════════
   KBI Admin — edit-mode controller (loaded only for logged-in admins)

   Responsibilities:
     • Toggle "Edit mode" on/off (state persisted across reloads).
     • Make tagged fields inline-editable; manage feature/detail lists.
     • Upload/replace images via /api/upload.
     • Save a card (PUT), add a card (POST + reload), delete a card (DELETE).

   The page tells us which content type it manages via
   #adminBar[data-collection]; the card carries its id in [data-id].
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const bar = document.getElementById('adminBar');
  if (!bar) return;
  const COLLECTION = bar.dataset.collection;
  const toggle = document.getElementById('editModeToggle');
  const STORAGE_KEY = 'kbiEditMode';

  document.body.classList.add('has-admin-bar');

  // ---- toast --------------------------------------------------------
  const toastEl = document.getElementById('adminToast');
  let toastTimer;
  function toast(msg, kind) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.className = 'admin-toast show ' + (kind || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.className = 'admin-toast ' + (kind || ''); }, 2600);
  }

  // ---- API helpers --------------------------------------------------
  async function api(method, url, body) {
    const opts = { method, headers: {} };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    if (!res.ok) {
      let detail = res.statusText;
      try { detail = (await res.json()).error || detail; } catch (e) {}
      throw new Error(detail);
    }
    return res.status === 204 ? null : res.json();
  }

  // ---- edit-mode toggling ------------------------------------------
  function setEditMode(on) {
    document.body.classList.toggle('edit-mode', on);
    document.querySelectorAll('[data-edit-only]').forEach(el => { el.hidden = !on; });
    document.querySelectorAll('.machine-card').forEach(card => decorateCard(card, on));
    sessionStorage.setItem(STORAGE_KEY, on ? '1' : '0');
  }

  function setEditable(el, on) {
    if (el) el.contentEditable = on ? 'true' : 'false';
  }

  function decorateCard(card, on) {
    card.querySelectorAll('[data-edit-field]').forEach(el => setEditable(el, on));
    card.querySelectorAll('[data-edit-list] .feature-tag, [data-edit-list] li')
        .forEach(el => setEditable(el, on));

    // Sync the category dropdown with the card's current category.
    const sel = card.querySelector('[data-edit-category]');
    if (sel) sel.value = card.dataset.category || '';

    if (on) addListControls(card); else removeListControls(card);
  }

  // ---- editable list (features / details / steps…) controls ---------
  // Each list declares how to add items:
  //   data-edit-list="<field>"  data-edit-item="<css>"  data-add-label="<word>"
  function itemSelector(list) { return list.dataset.editItem || 'li'; }

  function makeListItem(list) {
    const sel = itemSelector(list);
    let node;
    if (sel === 'li' || sel === '') {
      node = document.createElement('li');
    } else {
      node = document.createElement('span');
      node.className = sel.replace(/^\./, '');  // ".feature-tag" -> "feature-tag"
    }
    node.contentEditable = 'true';
    return node;
  }

  function addListControls(card) {
    card.querySelectorAll('[data-edit-list]').forEach(list => {
      if (list.nextElementSibling && list.nextElementSibling.classList.contains('edit-add-chip')) return;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'edit-add-chip';
      chip.textContent = '+ ' + (list.dataset.addLabel || 'item');
      chip.title = 'Add an item (clear an item’s text to remove it on save)';
      chip.addEventListener('click', () => {
        const node = makeListItem(list);
        list.appendChild(node);
        node.focus();
      });
      list.insertAdjacentElement('afterend', chip);
    });
  }

  function removeListControls(card) {
    card.querySelectorAll('.edit-add-chip').forEach(c => c.remove());
  }

  // ---- generic, attribute-driven field collection ------------------
  // Works for any content type: pages only need the right data-* markup.
  function collectCard(card) {
    const data = {};
    card.querySelectorAll('[data-edit-field]').forEach(el => {
      let val = el.textContent.trim();
      if (el.dataset.editType === 'number') {
        const n = parseInt(val, 10);
        val = Number.isNaN(n) ? 0 : n;
      }
      data[el.dataset.editField] = val;
    });
    card.querySelectorAll('[data-edit-list]').forEach(list => {
      const items = Array.from(list.querySelectorAll(itemSelector(list)))
                         .map(el => el.textContent.trim())
                         .filter(Boolean);
      data[list.dataset.editList] = items;
    });
    const sel = card.querySelector('[data-edit-category]');
    if (sel) data.category = sel.value;
    const img = card.querySelector('[data-edit-image]');
    if (img) data.image = img.getAttribute('src') || '';
    return data;
  }

  function pruneEmpty(card) {
    card.querySelectorAll('[data-edit-list]').forEach(list => {
      list.querySelectorAll(itemSelector(list))
          .forEach(el => { if (!el.textContent.trim()) el.remove(); });
    });
  }

  async function saveCard(card) {
    const id = card.dataset.id;
    const data = collectCard(card);
    try {
      const saved = await api('PUT', `/api/${COLLECTION}/${id}`, data);
      card.dataset.name = saved.name || saved.title || '';
      if (saved.category) card.dataset.category = saved.category;
      pruneEmpty(card);
      toast('Saved “' + (saved.name || saved.title || 'item') + '”', 'success');
    } catch (err) {
      toast('Save failed: ' + err.message, 'error');
    }
  }

  async function deleteCard(card) {
    const id = card.dataset.id;
    const name = card.dataset.name || 'this item';
    if (!confirm(`Delete “${name}”? This cannot be undone.`)) return;
    try {
      await api('DELETE', `/api/${COLLECTION}/${id}`);
      card.remove();
      toast('Deleted', 'success');
    } catch (err) {
      toast('Delete failed: ' + err.message, 'error');
    }
  }

  async function addItem(blank) {
    try {
      await api('POST', `/api/${COLLECTION}`, blank);
      sessionStorage.setItem(STORAGE_KEY, '1');  // stay in edit mode after reload
      toast('Added — reloading…', 'success');
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      toast('Add failed: ' + err.message, 'error');
    }
  }

  // ---- image slots: delete + in-place upload (instant save) ---------
  // A single reusable file picker; we remember which slot triggered it.
  let pendingSlot = null;
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  // Persist a single field of the card this slot belongs to, immediately.
  async function persistImage(slot, url) {
    const card = slot.closest('[data-id]');
    if (!card) return;  // brand-new unsaved card: value stays in the DOM only
    await api('PUT', `/api/${COLLECTION}/${card.dataset.id}`, { image: url });
  }

  function showUploader(slot, show) {
    const img = slot.querySelector('[data-edit-image]');
    const uploader = slot.querySelector('.img-uploader');
    const del = slot.querySelector('.img-del');
    if (uploader) uploader.hidden = !show;
    if (img) img.hidden = show;          // hide the image while the uploader shows
    if (del) del.hidden = show;          // no delete button when there's no image
  }

  async function deleteImage(slot) {
    const img = slot.querySelector('[data-edit-image]');
    if (img) img.removeAttribute('src');
    showUploader(slot, true);
    try {
      await persistImage(slot, '');
      toast('Image removed — upload a new one', 'success');
    } catch (err) {
      toast('Could not remove image: ' + err.message, 'error');
    }
  }

  async function uploadToSlot(slot, file) {
    if (!file) return;
    const uploader = slot.querySelector('.img-uploader');
    if (uploader) uploader.classList.add('busy');
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
      const { url } = await res.json();
      const img = slot.querySelector('[data-edit-image]');
      if (img) img.setAttribute('src', url);
      showUploader(slot, false);
      await persistImage(slot, url);
      toast('Image updated', 'success');
    } catch (err) {
      toast('Upload failed: ' + err.message, 'error');
    } finally {
      if (uploader) uploader.classList.remove('busy');
    }
  }

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    const slot = pendingSlot;
    fileInput.value = '';
    pendingSlot = null;
    if (file && slot) uploadToSlot(slot, file);
  });

  // Drag-and-drop straight onto an uploader zone.
  document.addEventListener('dragover', (e) => {
    const up = e.target.closest && e.target.closest('.img-uploader');
    if (up) { e.preventDefault(); up.classList.add('dragover'); }
  });
  document.addEventListener('dragleave', (e) => {
    const up = e.target.closest && e.target.closest('.img-uploader');
    if (up) up.classList.remove('dragover');
  });
  document.addEventListener('drop', (e) => {
    const up = e.target.closest && e.target.closest('.img-uploader');
    if (!up) return;
    e.preventDefault();
    up.classList.remove('dragover');
    const slot = up.closest('[data-image-slot]');
    if (slot && e.dataTransfer.files[0]) uploadToSlot(slot, e.dataTransfer.files[0]);
  });

  // ---- event wiring -------------------------------------------------
  // Stop card-expand clicks while editing (capture phase, before machines.js).
  const grid = document.getElementById('machinesGrid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      if (!document.body.classList.contains('edit-mode')) return;

      const delBtn = e.target.closest('.img-del');
      if (delBtn) {
        deleteImage(delBtn.closest('[data-image-slot]'));
        return;
      }
      const uploader = e.target.closest('.img-uploader');
      if (uploader) {
        pendingSlot = uploader.closest('[data-image-slot]');
        fileInput.click();
        return;
      }
      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        const card = actionBtn.closest('.machine-card');
        if (actionBtn.dataset.action === 'save') saveCard(card);
        else if (actionBtn.dataset.action === 'delete') deleteCard(card);
        return;
      }
      // Any other click inside a card while editing: don't let it expand.
      if (e.target.closest('.machine-card') && !e.target.closest('.edit-add-chip')) {
        e.stopPropagation();
      }
    }, true);
  }

  // "Add" buttons declare their blank-item defaults in data-new-item (JSON).
  document.querySelectorAll('[data-add-item]').forEach(btn => {
    btn.addEventListener('click', () => {
      let blank = {};
      try { blank = JSON.parse(btn.dataset.newItem || '{}'); } catch (e) {}
      addItem(blank);
    });
  });

  if (toggle) {
    toggle.addEventListener('change', () => setEditMode(toggle.checked));
    // Restore persisted edit-mode state on load.
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      toggle.checked = true;
      setEditMode(true);
    }
  }
})();
