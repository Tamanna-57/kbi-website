# Deploying the test service (Cloud Run)

This deploys a **separate** Cloud Run service for testing the admin/editing
work — it does **not** touch the live `kbi-web-global` service. Run these in
**Cloud Shell** (project `arched-elixir-464218-j8`).

Pick names/values once:

```bash
export PROJECT=arched-elixir-464218-j8
export REGION=us-central1
export SERVICE=kbi-web-tamanna-test            # the test service name
export BUCKET=kbi-web-content                  # bucket for content + images (must be globally unique)
export ADMIN_PASSWORD='choose-a-strong-password'
export SECRET_KEY="$(python3 -c 'import secrets;print(secrets.token_hex(32))')"
gcloud config set project "$PROJECT"
```

### 1. Create the bucket (content + uploaded images live here)

```bash
gcloud storage buckets create "gs://$BUCKET" --location="$REGION" --uniform-bucket-level-access
# Make objects publicly readable so images and content can be served:
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" \
  --member=allUsers --role=roles/storage.objectViewer
```

### 2. Seed the initial content into the bucket

```bash
# from the repo root (the branch with this code checked out)
pip install --quiet google-cloud-storage
GCS_BUCKET="$BUCKET" python3 seed_gcs.py "$BUCKET"
```

### 3. Grant the runtime service account access to the bucket

```bash
# Find the service account the Cloud Run service will run as (the Compute
# default SA is used unless you set another). Grant object admin on the bucket:
PROJ_NUM="$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')"
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" \
  --member="serviceAccount:${PROJ_NUM}-compute@developer.gserviceaccount.com" \
  --role=roles/storage.objectAdmin
```

### 4. Deploy the test service from source

```bash
gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars "GCS_BUCKET=$BUCKET,ADMIN_PASSWORD=$ADMIN_PASSWORD,SECRET_KEY=$SECRET_KEY"
```

When it finishes it prints a `https://kbi-web-tamanna-test-....run.app` URL.

### 5. Try it

1. Open the service URL.
2. Scroll to the footer → click **Admin** → enter the password.
3. On Machines / Products / Processes, flip **Edit mode** (bottom bar):
   - click any text to edit it,
   - hover an image → **×** to delete, then drop/upload a new one in place,
   - **+ Add** to create an item, **Save** / **Delete** per card.
4. Reload — changes persist (they're stored in the bucket).

---

## Notes

- **Storage:** content is stored as `content/<type>.json` in the bucket;
  uploaded images go to `uploads/`. No database is used.
- **Env vars:** `GCS_BUCKET` switches the app from local files to the bucket.
  `ADMIN_PASSWORD` is the shared admin login. `SECRET_KEY` signs the login
  session — keep it stable so admins aren't logged out on each redeploy.
- **Going live later:** the same image + env vars deployed to `kbi-web-global`
  (with its own bucket, or this one) promotes the feature to production.
