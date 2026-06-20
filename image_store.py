"""Image upload abstraction for the KBI website CMS.

Two interchangeable backends behind one interface:

* ``GCSImageStore`` — production. Uploads to a Cloud Storage bucket and returns
  a public URL. Selected when ``GCS_BUCKET`` is set.
* ``LocalImageStore`` — development. Saves into ``static/uploads/`` and returns
  a ``/static/uploads/...`` path. No cloud credentials required.

The single public method is :meth:`save`, which accepts a Werkzeug
``FileStorage`` and returns the URL/path to store alongside the content item.
"""

import os
import threading
import uuid

from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}
_STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")


class UnsupportedImageError(ValueError):
    """Raised when an uploaded file has a disallowed extension."""


def _safe_name(filename):
    base = secure_filename(filename or "")
    ext = os.path.splitext(base)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise UnsupportedImageError(f"Unsupported image type: {ext or 'unknown'}")
    # Prefix with a short random token so re-uploads never clobber each other.
    return f"{uuid.uuid4().hex[:12]}{ext}"


class ImageStore:
    def save(self, file_storage):
        raise NotImplementedError


class LocalImageStore(ImageStore):
    """Saves uploads under ``static/uploads/`` for local development."""

    def __init__(self, static_dir=_STATIC_DIR, subdir="uploads"):
        self._dir = os.path.join(static_dir, subdir)
        self._subdir = subdir
        os.makedirs(self._dir, exist_ok=True)

    def save(self, file_storage):
        name = _safe_name(file_storage.filename)
        file_storage.save(os.path.join(self._dir, name))
        return f"/static/{self._subdir}/{name}"


class GCSImageStore(ImageStore):
    """Uploads to a Cloud Storage bucket and returns a public URL."""

    def __init__(self, bucket_name, prefix="uploads/"):
        from google.cloud import storage  # imported lazily

        self._client = storage.Client()
        self._bucket = self._client.bucket(bucket_name)
        self._prefix = prefix

    def save(self, file_storage):
        name = _safe_name(file_storage.filename)
        blob = self._bucket.blob(f"{self._prefix}{name}")
        file_storage.stream.seek(0)
        blob.upload_from_file(
            file_storage.stream,
            content_type=file_storage.mimetype or "application/octet-stream",
        )
        return blob.public_url


_store_singleton = None
_store_lock = threading.Lock()


def get_image_store():
    """Return the process-wide image store, building it on first use."""
    global _store_singleton
    if _store_singleton is not None:
        return _store_singleton
    with _store_lock:
        if _store_singleton is None:
            bucket = os.environ.get("GCS_BUCKET")
            if bucket:
                _store_singleton = GCSImageStore(bucket)
            else:
                _store_singleton = LocalImageStore()
    return _store_singleton
