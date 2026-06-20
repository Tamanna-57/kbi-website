"""Content storage abstraction for the KBI website CMS.

Two interchangeable backends sit behind one interface:

* ``FirestoreStore`` — used in production (Cloud Run). Each content type is a
  Firestore collection; each item is a document.
* ``JSONFileStore`` — used for local development. Each content type is a JSON
  file under ``content/``. No cloud credentials required.

The active backend is chosen automatically by :func:`get_store`:
Firestore is used when ``USE_FIRESTORE=1`` (and the library is importable),
otherwise the local JSON store is used. This keeps the editing UX fully
testable on a laptop before anything touches the cloud.

Every item is a plain ``dict`` carrying a string ``id`` key. The set of
content types ("collections") is defined by :data:`COLLECTIONS`.
"""

import json
import os
import re
import threading
import uuid

# Content types managed by the CMS. Phase 1 ships "machines"; the others are
# declared here so they can be wired up by reusing the exact same plumbing.
COLLECTIONS = ("machines", "products", "processes", "certifications",
               "awards", "customers", "team", "news")

_CONTENT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "content")


def _slugify(value, fallback="item"):
    """Turn a human string into a URL/document-id-safe slug."""
    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value or f"{fallback}-{uuid.uuid4().hex[:8]}"


class ContentStore:
    """Interface implemented by every backend."""

    def list_items(self, collection):
        raise NotImplementedError

    def get_item(self, collection, item_id):
        raise NotImplementedError

    def add_item(self, collection, data):
        raise NotImplementedError

    def update_item(self, collection, item_id, data):
        raise NotImplementedError

    def delete_item(self, collection, item_id):
        raise NotImplementedError

    # -- editable "blocks": free-form per-page text/image overrides -----
    # Stored as a single flat dict {key: value}. Templates supply a default
    # value and a stable key; an override here wins when present.
    def get_blocks(self):
        raise NotImplementedError

    def update_block(self, key, value):
        raise NotImplementedError

    # -- shared helpers -------------------------------------------------
    @staticmethod
    def _check_collection(collection):
        if collection not in COLLECTIONS:
            raise KeyError(f"Unknown content collection: {collection!r}")

    @staticmethod
    def _make_id(data):
        """Derive a stable id for a new item from its name/title, else random."""
        base = data.get("id") or data.get("name") or data.get("title")
        return _slugify(base, fallback="item")


class JSONFileStore(ContentStore):
    """Local-development backend backed by one JSON file per collection."""

    def __init__(self, content_dir=_CONTENT_DIR):
        self._dir = content_dir
        self._lock = threading.Lock()
        os.makedirs(self._dir, exist_ok=True)

    def _path(self, collection):
        return os.path.join(self._dir, f"{collection}.json")

    def _read(self, collection):
        path = self._path(collection)
        if not os.path.exists(path):
            return []
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)

    def _write(self, collection, items):
        path = self._path(collection)
        tmp = f"{path}.tmp"
        with open(tmp, "w", encoding="utf-8") as fh:
            json.dump(items, fh, ensure_ascii=False, indent=2)
            fh.write("\n")
        os.replace(tmp, path)

    def list_items(self, collection):
        self._check_collection(collection)
        with self._lock:
            return self._read(collection)

    def get_item(self, collection, item_id):
        self._check_collection(collection)
        with self._lock:
            for item in self._read(collection):
                if item.get("id") == item_id:
                    return item
        return None

    def add_item(self, collection, data):
        self._check_collection(collection)
        with self._lock:
            items = self._read(collection)
            existing = {it.get("id") for it in items}
            new_id = self._make_id(data)
            while new_id in existing:
                new_id = f"{new_id}-{uuid.uuid4().hex[:4]}"
            item = dict(data)
            item["id"] = new_id
            items.append(item)
            self._write(collection, items)
            return item

    def update_item(self, collection, item_id, data):
        self._check_collection(collection)
        with self._lock:
            items = self._read(collection)
            for idx, item in enumerate(items):
                if item.get("id") == item_id:
                    merged = dict(item)
                    merged.update(data)
                    merged["id"] = item_id  # id is immutable
                    items[idx] = merged
                    self._write(collection, items)
                    return merged
        return None

    def delete_item(self, collection, item_id):
        self._check_collection(collection)
        with self._lock:
            items = self._read(collection)
            kept = [it for it in items if it.get("id") != item_id]
            if len(kept) == len(items):
                return False
            self._write(collection, kept)
            return True

    def _blocks_path(self):
        return os.path.join(self._dir, "blocks.json")

    def get_blocks(self):
        path = self._blocks_path()
        if not os.path.exists(path):
            return {}
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)

    def update_block(self, key, value):
        with self._lock:
            blocks = self.get_blocks()
            blocks[key] = value
            path = self._blocks_path()
            tmp = f"{path}.tmp"
            with open(tmp, "w", encoding="utf-8") as fh:
                json.dump(blocks, fh, ensure_ascii=False, indent=2)
                fh.write("\n")
            os.replace(tmp, path)
        return {key: value}


class FirestoreStore(ContentStore):
    """Production backend backed by Cloud Firestore (Native mode)."""

    def __init__(self, prefix="content_"):
        from google.cloud import firestore  # imported lazily

        self._db = firestore.Client()
        # Collection names are namespaced so CMS data is easy to spot.
        self._prefix = prefix

    def _col(self, collection):
        return self._db.collection(f"{self._prefix}{collection}")

    def list_items(self, collection):
        self._check_collection(collection)
        docs = self._col(collection).order_by("name").stream()
        out = []
        for doc in docs:
            data = doc.to_dict() or {}
            data["id"] = doc.id
            out.append(data)
        return out

    def get_item(self, collection, item_id):
        self._check_collection(collection)
        doc = self._col(collection).document(item_id).get()
        if not doc.exists:
            return None
        data = doc.to_dict() or {}
        data["id"] = doc.id
        return data

    def add_item(self, collection, data):
        self._check_collection(collection)
        col = self._col(collection)
        new_id = self._make_id(data)
        while col.document(new_id).get().exists:
            new_id = f"{new_id}-{uuid.uuid4().hex[:4]}"
        payload = {k: v for k, v in data.items() if k != "id"}
        col.document(new_id).set(payload)
        result = dict(payload)
        result["id"] = new_id
        return result

    def update_item(self, collection, item_id, data):
        self._check_collection(collection)
        ref = self._col(collection).document(item_id)
        if not ref.get().exists:
            return None
        payload = {k: v for k, v in data.items() if k != "id"}
        ref.set(payload, merge=True)
        return self.get_item(collection, item_id)

    def delete_item(self, collection, item_id):
        self._check_collection(collection)
        ref = self._col(collection).document(item_id)
        if not ref.get().exists:
            return False
        ref.delete()
        return True

    def _blocks_ref(self):
        return self._db.collection(f"{self._prefix}blocks").document("site")

    def get_blocks(self):
        doc = self._blocks_ref().get()
        return doc.to_dict() or {} if doc.exists else {}

    def update_block(self, key, value):
        self._blocks_ref().set({key: value}, merge=True)
        return {key: value}


class GCSJsonStore(ContentStore):
    """Production backend that keeps each collection as one JSON object in a
    Cloud Storage bucket (``content/<collection>.json``).

    This is the "no database" option: the same bucket also holds uploaded
    images (under ``uploads/``), so production needs exactly one bucket and no
    Firestore. Writes use a read-modify-write guarded by the blob's generation
    so two near-simultaneous saves can't silently clobber each other.
    """

    def __init__(self, bucket_name, prefix="content/"):
        from google.cloud import storage  # imported lazily

        self._client = storage.Client()
        self._bucket = self._client.bucket(bucket_name)
        self._prefix = prefix
        self._lock = threading.Lock()

    def _blob(self, collection):
        return self._bucket.blob(f"{self._prefix}{collection}.json")

    def _read(self, collection):
        """Return ``(items, generation)``; generation is None if absent."""
        blob = self._blob(collection)
        if not blob.exists():
            return [], None
        blob.reload()
        data = blob.download_as_text()
        return (json.loads(data) if data.strip() else []), blob.generation

    def _write(self, collection, items, generation):
        blob = self._blob(collection)
        payload = json.dumps(items, ensure_ascii=False, indent=2)
        # Guard against lost updates: only write if the object is unchanged
        # since we read it (generation match), or still absent (gen 0).
        if generation is None:
            blob.upload_from_string(payload, content_type="application/json",
                                    if_generation_match=0)
        else:
            blob.upload_from_string(payload, content_type="application/json",
                                    if_generation_match=generation)

    def _mutate(self, collection, mutator):
        """Read-modify-write with a few retries on generation conflicts."""
        from google.api_core import exceptions as gcx

        for _ in range(5):
            items, generation = self._read(collection)
            result, new_items = mutator(items)
            try:
                self._write(collection, new_items, generation)
                return result
            except gcx.PreconditionFailed:
                continue  # someone else wrote; retry with fresh data
        raise RuntimeError(f"Could not write {collection}: too much contention")

    def list_items(self, collection):
        self._check_collection(collection)
        with self._lock:
            return self._read(collection)[0]

    def get_item(self, collection, item_id):
        self._check_collection(collection)
        for item in self.list_items(collection):
            if item.get("id") == item_id:
                return item
        return None

    def add_item(self, collection, data):
        self._check_collection(collection)

        def mutator(items):
            existing = {it.get("id") for it in items}
            new_id = self._make_id(data)
            while new_id in existing:
                new_id = f"{new_id}-{uuid.uuid4().hex[:4]}"
            item = dict(data)
            item["id"] = new_id
            return item, items + [item]

        with self._lock:
            return self._mutate(collection, mutator)

    def update_item(self, collection, item_id, data):
        self._check_collection(collection)

        def mutator(items):
            for idx, item in enumerate(items):
                if item.get("id") == item_id:
                    merged = dict(item)
                    merged.update(data)
                    merged["id"] = item_id
                    new_items = list(items)
                    new_items[idx] = merged
                    return merged, new_items
            return None, items

        with self._lock:
            return self._mutate(collection, mutator)

    def delete_item(self, collection, item_id):
        self._check_collection(collection)

        def mutator(items):
            kept = [it for it in items if it.get("id") != item_id]
            return (len(kept) != len(items)), kept

        with self._lock:
            return self._mutate(collection, mutator)

    def _blocks_blob(self):
        return self._bucket.blob(f"{self._prefix}blocks.json")

    def get_blocks(self):
        blob = self._blocks_blob()
        if not blob.exists():
            return {}
        blob.reload()
        data = blob.download_as_text()
        return json.loads(data) if data.strip() else {}

    def update_block(self, key, value):
        from google.api_core import exceptions as gcx

        with self._lock:
            for _ in range(5):
                blob = self._blocks_blob()
                if blob.exists():
                    blob.reload()
                    text = blob.download_as_text()
                    blocks = json.loads(text) if text.strip() else {}
                    generation = blob.generation
                else:
                    blocks, generation = {}, None
                blocks[key] = value
                payload = json.dumps(blocks, ensure_ascii=False, indent=2)
                try:
                    if generation is None:
                        blob.upload_from_string(payload, content_type="application/json",
                                                if_generation_match=0)
                    else:
                        blob.upload_from_string(payload, content_type="application/json",
                                                if_generation_match=generation)
                    return {key: value}
                except gcx.PreconditionFailed:
                    continue
            raise RuntimeError("Could not write blocks: too much contention")


_store_singleton = None
_store_lock = threading.Lock()


def get_store():
    """Return the process-wide content store, building it on first use.

    Selection order:
      * ``USE_FIRESTORE=1``      -> Firestore (optional, not the default)
      * ``GCS_BUCKET`` is set    -> GCS JSON objects (production default)
      * otherwise                -> local JSON files (development)
    """
    global _store_singleton
    if _store_singleton is not None:
        return _store_singleton
    with _store_lock:
        if _store_singleton is None:
            if os.environ.get("USE_FIRESTORE") == "1":
                _store_singleton = FirestoreStore()
            elif os.environ.get("GCS_BUCKET"):
                _store_singleton = GCSJsonStore(os.environ["GCS_BUCKET"])
            else:
                _store_singleton = JSONFileStore()
    return _store_singleton
