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
    document.querySelectorAll('[data-edit-card]').forEach(card => decorateCard(card, on));
    // Free-form page text blocks (outside any card).
    document.querySelectorAll('[data-block-text], [data-block-rich]').forEach(el => setEditable(el, on));
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
    if (sel.startsWith('.')) {
      node = document.createElement('span');
      node.className = sel.slice(1);          // ".feature-tag" -> class feature-tag
    } else {
      node = document.createElement(sel || 'li');  // bare tag: "li", "span", …
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

  // A card may belong to a different collection than the page default
  // (pages like Certifications host more than one list).
  function cardCollection(card) {
    return (card && card.dataset.collection) || COLLECTION;
  }

  async function saveCard(card, opts) {
    const silent = opts && opts.silent;
    const id = card.dataset.id;
    const data = collectCard(card);
    try {
      const saved = await api('PUT', `/api/${cardCollection(card)}/${id}`, data);
      card.dataset.name = saved.name || saved.title || '';
      if (saved.category) card.dataset.category = saved.category;
      pruneEmpty(card);
      if (!silent) toast('Saved “' + (saved.name || saved.title || 'item') + '”', 'success');
      return true;
    } catch (err) {
      if (!silent) toast('Save failed: ' + err.message, 'error');
      return false;
    }
  }

  async function deleteCard(card) {
    const id = card.dataset.id;
    const name = card.dataset.name || 'this item';
    if (!confirm(`Delete “${name}”? This cannot be undone.`)) return;
    try {
      await api('DELETE', `/api/${cardCollection(card)}/${id}`);
      card.remove();
      toast('Deleted', 'success');
    } catch (err) {
      toast('Delete failed: ' + err.message, 'error');
    }
  }

  async function addItem(blank, collection) {
    try {
      await api('POST', `/api/${collection || COLLECTION}`, blank);
      sessionStorage.setItem(STORAGE_KEY, '1');  // stay in edit mode after reload
      bypassUnloadWarning = true;                // this reload is intentional
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

  // ════════════════════════════════════════════════════════════════
  //  DEFERRED SAVE MODEL
  //  Every edit (text, list item, card field, image) is staged in the DOM
  //  and only written to the server when the admin clicks "Save changes".
  //  So nothing goes live until an explicit save.
  // ════════════════════════════════════════════════════════════════
  const dirtyBlocks = new Map();        // block key -> text element
  const dirtyBlockImages = new Map();   // block key -> staged image url ('' = removed)
  let dirty = false;
  let bypassUnloadWarning = false;

  function markDirty() { dirty = true; updateSaveBtn(); }
  function clearDirty() { dirty = false; updateSaveBtn(); }
  function updateSaveBtn() {
    const btn = document.getElementById('adminSaveAll');
    if (!btn) return;
    btn.classList.toggle('has-changes', dirty);
    btn.textContent = dirty ? '● Save changes' : 'Save changes';
  }

  // ---- editable text blocks: staged, saved on demand ----------------
  function blockEl(target) {
    return target.closest && target.closest('[data-block-text], [data-block-rich]');
  }
  function blockValue(el) {
    return el.hasAttribute('data-block-rich') ? el.innerHTML : el.textContent.trim();
  }
  async function saveBlock(el) {
    await api('POST', '/api/block', { key: el.dataset.block, value: blockValue(el) });
    dirtyBlocks.delete(el.dataset.block);
  }

  // Any edit just marks the page dirty (and remembers which block changed).
  document.addEventListener('input', (e) => {
    if (!document.body.classList.contains('edit-mode')) return;
    const bel = blockEl(e.target);
    if (bel) { dirtyBlocks.set(bel.dataset.block, bel); markDirty(); return; }
    if (e.target.closest && e.target.closest('[data-edit-card]')) markDirty();
  });

  function showUploader(slot, show) {
    const img = slot.querySelector('[data-edit-image]');
    const uploader = slot.querySelector('.img-uploader');
    const del = slot.querySelector('.img-del');
    if (uploader) uploader.hidden = !show;
    if (img) img.hidden = show;          // hide the image while the uploader shows
    if (del) del.hidden = show;          // no delete button when there's no image
  }

  // Apply an image change to the DOM only — persistence waits for Save.
  // Card images ride along when the card is saved (collectCard reads the src);
  // block images (page heroes, etc.) are staged here and saved by saveAll().
  function applyImage(slot, url) {
    const img = slot.querySelector('[data-edit-image]');
    if (url) {
      if (img) img.setAttribute('src', url);
      showUploader(slot, false);
    } else {
      if (img) img.removeAttribute('src');
      showUploader(slot, true);
    }
    if (slot.dataset.blockImage) dirtyBlockImages.set(slot.dataset.blockImage, url || '');
    markDirty();
  }

  function deleteImage(slot) {
    applyImage(slot, '');
    toast('Image removed — click Save to publish', 'success');
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
      applyImage(slot, url);
      toast('Image staged — click Save to publish', 'success');
    } catch (err) {
      toast('Upload failed: ' + err.message, 'error');
    } finally {
      if (uploader) uploader.classList.remove('busy');
    }
  }

  // ---- the one page-level Save -------------------------------------
  async function saveAll() {
    const btn = document.getElementById('adminSaveAll');
    const cards = Array.from(document.querySelectorAll('[data-edit-card][data-id]'));
    const blocks = Array.from(dirtyBlocks.values());
    const blockImgs = Array.from(dirtyBlockImages.entries());
    if (!cards.length && !blocks.length && !blockImgs.length) {
      toast('No changes to save yet', '');
      return;
    }
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    let ok = 0, fail = 0;
    for (const card of cards) { if (await saveCard(card, { silent: true })) ok++; else fail++; }
    for (const el of blocks) { try { await saveBlock(el); ok++; } catch (e) { fail++; } }
    for (const [key, url] of blockImgs) {
      try { await api('POST', '/api/block', { key, value: url }); dirtyBlockImages.delete(key); ok++; }
      catch (e) { fail++; }
    }
    if (btn) btn.disabled = false;
    if (!fail) clearDirty(); else updateSaveBtn();
    toast(`Saved ${ok} change${ok === 1 ? '' : 's'}` + (fail ? ` — ${fail} failed` : ''),
          fail ? 'error' : 'success');
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
  // Document-level capture so it works on every page and runs before any
  // page script (e.g. machines.js card-expand) sees the click.
  document.addEventListener('click', (e) => {
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
      const card = actionBtn.closest('[data-edit-card]');
      if (actionBtn.dataset.action === 'save') saveCard(card);
      else if (actionBtn.dataset.action === 'delete') deleteCard(card);
      return;
    }
    // Other clicks inside a card while editing must not trigger page
    // behaviours like card-expand; let buttons/chips/inputs through.
    if (e.target.closest('[data-edit-card]') &&
        !e.target.closest('.edit-add-chip, button, select, input, a')) {
      e.stopPropagation();
    }
  }, true);

  // "Add" buttons declare their blank-item defaults in data-new-item (JSON)
  // and optionally a target collection in data-collection.
  document.querySelectorAll('[data-add-item]').forEach(btn => {
    btn.addEventListener('click', () => {
      let blank = {};
      try { blank = JSON.parse(btn.dataset.newItem || '{}'); } catch (e) {}
      addItem(blank, btn.dataset.collection);
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

  // Page-level Save button + unsaved-changes guard.
  const saveAllBtn = document.getElementById('adminSaveAll');
  if (saveAllBtn) { saveAllBtn.addEventListener('click', saveAll); updateSaveBtn(); }

  window.addEventListener('beforeunload', (e) => {
    if (bypassUnloadWarning) return;
    if (dirty && document.body.classList.contains('edit-mode')) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
})();
