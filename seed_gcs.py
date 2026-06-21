"""One-time seeding of site content into a Cloud Storage bucket.

Uploads each local ``content/<collection>.json`` to
``gs://<bucket>/content/<collection>.json`` — the exact layout the running
app's GCSJsonStore reads. Run this once after creating the bucket so the
deployed site has its initial content; afterwards all edits happen through
the admin UI and are written straight to the bucket.

Usage (e.g. in Cloud Shell):
    python seed_gcs.py <bucket-name>
    # or:  GCS_BUCKET=<bucket-name> python seed_gcs.py

Add --force to overwrite collections that already exist in the bucket
(by default existing objects are left untouched so you don't clobber live
edits by re-running the script).
"""

import os
import sys

from content_store import COLLECTIONS, _CONTENT_DIR


def main(argv):
    force = "--force" in argv
    args = [a for a in argv if not a.startswith("--")]
    bucket_name = (args[0] if args else None) or os.environ.get("GCS_BUCKET")
    if not bucket_name:
        sys.exit("Usage: python seed_gcs.py <bucket-name> [--force]")

    from google.cloud import storage

    client = storage.Client()
    bucket = client.bucket(bucket_name)

    for collection in COLLECTIONS:
        local_path = os.path.join(_CONTENT_DIR, f"{collection}.json")
        if not os.path.exists(local_path):
            print(f"skip   {collection}: no local file")
            continue
        blob = bucket.blob(f"content/{collection}.json")
        if blob.exists() and not force:
            print(f"keep   {collection}: already in bucket (use --force to overwrite)")
            continue
        with open(local_path, "r", encoding="utf-8") as fh:
            data = fh.read()
        blob.upload_from_string(data, content_type="application/json")
        print(f"upload {collection}: -> gs://{bucket_name}/content/{collection}.json")

    print("Done.")


if __name__ == "__main__":
    main(sys.argv[1:])
