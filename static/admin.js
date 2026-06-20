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

  // ---- editable list (features / details) controls ------------------
  function addListControls(card) {
    card.querySelectorAll('[data-edit-list]').forEach(list => {
      if (list.parentElement.querySelector('.edit-add-chip')) return;
      const isTags = list.classList.contains('machine-features');
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'edit-add-chip';
      chip.textContent = isTags ? '+ tag' : '+ detail';
      chip.title = 'Add an item (clear an item’s text to remove it)';
      chip.addEventListener('click', () => {
        let node;
        if (isTags) {
          node = document.createElement('span');
          node.className = 'feature-tag';
          node.contentEditable = 'true';
          list.appendChild(node);
        } else {
          node = document.createElement('li');
          node.contentEditable = 'true';
          list.appendChild(node);
        }
        node.focus();
      });
      // Place the chip right after the list element.
      list.insertAdjacentElement('afterend', chip);
    });
  }

  function removeListControls(card) {
    card.querySelectorAll('.edit-add-chip').forEach(c => c.remove());
  }

  // ---- gather + save a card ----------------------------------------
  function readField(card, name) {
    const el = card.querySelector(`[data-edit-field="${name}"]`);
    return el ? el.textContent.trim() : '';
  }

  function readList(card, name) {
    const list = card.querySelector(`[data-edit-list="${name}"]`);
    if (!list) return [];
    const sel = name === 'features' ? '.feature-tag' : 'li';
    return Array.from(list.querySelectorAll(sel))
                .map(el => el.textContent.trim())
                .filter(Boolean);
  }

  function pruneEmpty(card) {
    card.querySelectorAll('[data-edit-list] .feature-tag, [data-edit-list] li')
        .forEach(el => { if (!el.textContent.trim()) el.remove(); });
  }

  function collectMachine(card) {
    const sel = card.querySelector('[data-edit-category]');
    const qty = parseInt(readField(card, 'quantity'), 10);
    const img = card.querySelector('[data-edit-image]');
    return {
      category: sel ? sel.value : card.dataset.category,
      category_label: readField(card, 'category_label'),
      name: readField(card, 'name'),
      description: readField(card, 'description'),
      quantity: Number.isNaN(qty) ? 0 : qty,
      image: img ? img.getAttribute('src') : '',
      features: readList(card, 'features'),
      details: readList(card, 'details'),
    };
  }

  async function saveCard(card) {
    const id = card.dataset.id;
    const data = collectMachine(card);
    try {
      const saved = await api('PUT', `/api/${COLLECTION}/${id}`, data);
      // Reflect canonical values back onto the card.
      card.dataset.name = saved.name;
      card.dataset.category = saved.category;
      pruneEmpty(card);
      toast('Saved “' + saved.name + '”', 'success');
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

  async function addMachine() {
    const blank = {
      category: 'presses', category_label: 'Presses',
      name: 'New machine', description: 'Description goes here.',
      quantity: 1, image: '/static/pics/process_Pressing.webp',
      features: [], details: [],
    };
    try {
      await api('POST', `/api/${COLLECTION}`, blank);
      sessionStorage.setItem(STORAGE_KEY, '1');  // stay in edit mode after reload
      toast('Added — reloading…', 'success');
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      toast('Add failed: ' + err.message, 'error');
    }
  }

  // ---- image replace ------------------------------------------------
  let pendingImageTarget = null;
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file || !pendingImageTarget) return;
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
      const { url } = await res.json();
      pendingImageTarget.setAttribute('src', url);
      toast('Image uploaded — remember to Save', 'success');
    } catch (err) {
      toast('Upload failed: ' + err.message, 'error');
    } finally {
      fileInput.value = '';
      pendingImageTarget = null;
    }
  });

  // ---- event wiring -------------------------------------------------
  // Stop card-expand clicks while editing (capture phase, before machines.js).
  const grid = document.getElementById('machinesGrid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      if (!document.body.classList.contains('edit-mode')) return;

      const replaceBtn = e.target.closest('.machine-img-replace');
      if (replaceBtn) {
        pendingImageTarget = replaceBtn.closest('.machine-image').querySelector('[data-edit-image]');
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

  const addBtn = document.getElementById('addMachineBtn');
  if (addBtn) addBtn.addEventListener('click', addMachine);

  if (toggle) {
    toggle.addEventListener('change', () => setEditMode(toggle.checked));
    // Restore persisted edit-mode state on load.
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      toggle.checked = true;
      setEditMode(true);
    }
  }
})();
