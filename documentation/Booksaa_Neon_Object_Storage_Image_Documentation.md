# Booksaa — Neon Object Storage & Image Storage

**Purpose:** Future reference for Booksaa image/file storage.

**Last updated:** 2026-10-02

## 1. Current architecture

Booksaa uses **Neon Object Storage** for uploaded images. Neon Object Storage exposes an S3-compatible API, so the application uses the AWS SDK S3 client.

Current setup:

- Provider: Neon Object Storage
- Bucket: `assets`
- Bucket visibility: **Private**
- Region used in the current setup: `us-east-1`
- SDK: AWS SDK S3 client (`@aws-sdk/client-s3`)
- Main storage helper: `lib/storage.js`
- Image/object keys are stored in PostgreSQL/Prisma, not the image binary itself.
- Browser access should use a signed/view URL rather than making the bucket public.

## 2. Environment variables

The current storage configuration uses:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_ENDPOINT_URL_S3
AWS_REGION
```

Never commit these values to Git and never expose them through `NEXT_PUBLIC_*` variables.

For Vercel, configure the correct storage variables for the corresponding Production/Preview/Staging environment.

## 3. S3 client configuration

The important part of the current `lib/storage.js` setup is:

```js
import { S3Client } from "@aws-sdk/client-s3";

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_ENDPOINT_URL_S3,
  AWS_REGION,
} = process.env;

export const STORAGE_BUCKET = "assets";

export const s3 = new S3Client({
  region: AWS_REGION,
  endpoint: AWS_ENDPOINT_URL_S3,
  forcePathStyle: true,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});
```

### Important historical fix

`forcePathStyle: true` was required to fix the Neon Object Storage S3 certificate/upload problem encountered in the Booksaa setup.

Do not remove it without testing against Neon Object Storage.

## 4. Why images are not stored in Prisma

Prisma/PostgreSQL should store the **object key**, not the actual image file.

Example:

```text
vendors/<vendorId>/branding/<uuid>.jpg
```

The architecture is:

```text
Browser
   |
   | upload
   v
Neon Object Storage
   |
   | object key
   v
PostgreSQL / Prisma
```

Benefits:

- Keeps the database small.
- Object storage handles large files.
- Makes signed URLs possible.
- Makes future migration to another S3-compatible provider easier.

## 5. Object key convention

Use namespaced keys rather than original filenames.

Recommended/current pattern:

```text
vendors/{vendorId}/branding/{uuid}.{ext}
vendors/{vendorId}/services/{serviceId}/{uuid}.{ext}
vendors/{vendorId}/professionals/{professionalId}/{uuid}.{ext}
vendors/{vendorId}/gallery/{uuid}.{ext}
customers/{customerId}/profile/{uuid}.{ext}
```

Example:

```text
vendors/cm123/branding/9b2f-example.jpg
vendors/cm123/services/cm456/71a8-example.webp
vendors/cm123/gallery/81ca-example.jpg
```

Use UUIDs to avoid collisions and problematic filenames.

## 6. What Prisma should store

For a single image:

```js
image: "vendors/vendor-id/branding/uuid.jpg"
```

For a gallery, Booksaa has used a JSON array of keys:

```js
photos: [
  "vendors/vendor-id/gallery/uuid-1.jpg",
  "vendors/vendor-id/gallery/uuid-2.jpg"
]
```

### Do not store temporary signed URLs

Store:

```text
vendors/abc/gallery/image.jpg
```

Not:

```text
https://...temporary-signed-url...
```

Signed URLs expire and should be generated again when needed.

## 7. Private bucket and image viewing

The `assets` bucket is private.

The intended flow is:

```text
Prisma
  |
  | imageKey
  v
Booksaa API / storage helper
  |
  | signed URL
  v
Browser
  |
  | <img src="signed-url" />
  v
Neon Object Storage
```

This keeps the underlying bucket private.

## 8. Existing `/api/storage/view`

Booksaa has an image-view API that resolves a storage key into a browser-usable URL.

The response has been structured approximately as:

```json
{
  "key": "vendors/abc/branding/logo.jpg",
  "url": "https://..."
}
```

Typical frontend usage:

```js
const response = await fetch(
  `/api/storage/view?key=${encodeURIComponent(imageKey)}`
);

const data = await response.json();

setImageUrl(data.url);
```

Keep the exact current query parameter/route implementation aligned with the repository if it changes.

## 9. Image URL resolution

Booksaa has used a reusable profile-image resolution approach where a stored object key is resolved through `/api/storage/view` before being displayed.

Conceptually:

```js
async function resolveProfileImageUrl(imageKey) {
  if (!imageKey) return "";

  // Already a normal URL/value.
  if (!imageKey.startsWith("vendors/")) {
    return imageKey;
  }

  const response = await fetch(
    `/api/storage/view?key=${encodeURIComponent(imageKey)}`
  );

  const data = await response.json();
  return data.url || "";
}
```

Keep S3 credentials and storage operations server-side. Never put S3 credentials in a client component.

## 10. Business profile images

The business profile currently uses a field such as:

```js
form.image
```

The UI displays the resolved value with an image element.

If the database value is an object key such as:

```text
vendors/abc/branding/logo.jpg
```

resolve it through the storage-view mechanism before using it as the final browser image URL.

## 11. Business gallery

The business profile Photos tab currently uses components similar to:

```jsx
<PhotoUpload />
<GalleryGrid photos={form?.photos} />
```

`photos` is treated as a JSON array of storage keys.

Example:

```js
[
  "vendors/vendor-id/gallery/photo-1.jpg",
  "vendors/vendor-id/gallery/photo-2.jpg"
]
```

`GalleryGrid` resolves/render these images and can provide gallery/lightbox behavior.

### Historical gallery date issue

The storage-view response previously returned:

```json
{
  "key": "...",
  "url": "..."
}
```

but did not include `lastModified`.

The gallery date-filter logic expected modification-date information, which could result in an invalid date/`NaN`.

If date filtering is required, either:

1. Return `lastModified` from a storage listing/view API, or
2. Store the relevant image date/metadata in Prisma.

Do not try to derive a reliable upload date from a signed URL.

## 12. Recommended upload flow

For future implementation, prefer direct/presigned uploads where appropriate:

```text
1. Browser selects image
        |
        v
2. Booksaa API validates request and creates upload authorization
        |
        v
3. Browser uploads directly to Neon Object Storage
        |
        v
4. Object key is returned/known
        |
        v
5. Booksaa stores object key in Prisma
```

This avoids unnecessarily passing large image files through the Next.js server.

## 13. Image replacement/deletion

Replacement:

```text
Upload new image
      |
      v
Save new object key in Prisma
      |
      v
Optionally delete old object
```

Deletion:

```text
Delete Prisma reference
      +
Delete object from Neon Object Storage
```

Handle these operations carefully so the database does not point to an object that was deleted prematurely.

## 14. Multi-tenant security

Booksaa is a multi-vendor SaaS, so object keys should be scoped by vendor where applicable:

```text
vendors/{vendorId}/...
```

Do not trust a client-supplied `vendorId` for authorization.

For vendor-specific operations, derive the vendor from the authenticated session and verify ownership/access on the server.

## 15. Recommended storage abstraction

Keep provider-specific implementation inside `lib/storage.js`.

Useful server-side functions can include:

```js
uploadObject(...)
getSignedUrl(...)
deleteObject(...)
createPresignedUpload(...)
```

Application/API code should not need to know the Neon endpoint or S3 implementation details.

Suggested structure:

```text
lib/
  storage.js

utils/
  image.js

app/
  api/
    storage/
      view/
        route.js

components/
  photos/
    PhotoUpload.jsx
    GalleryGrid.jsx
```

Responsibilities:

### `lib/storage.js`

- S3 client
- bucket configuration
- upload
- delete
- signed URLs
- presigned uploads

### `/api/storage/...`

- Authentication
- Authorization
- Request validation
- Calling storage helpers

### `utils/image.js`

- Frontend-safe image URL helpers
- Image-key normalization
- Reusable URL resolution

### `PhotoUpload`

- File selection
- Validation
- Upload UX
- Error/loading states
- Returning/saving object keys

### `GalleryGrid`

- Displaying images
- Empty state
- Lightbox/gallery behavior
- Optional image metadata/filtering

## 16. Upload validation

The upload API should validate at least:

- MIME type
- File extension
- Maximum file size
- Object-key/path scope
- Authenticated vendor ownership
- Allowed image formats

Do not let a client freely choose arbitrary storage paths.

## 17. Future migration to MinIO or another provider

One reason for storing object keys instead of provider-specific URLs is portability.

For example, this database value can remain unchanged:

```text
vendors/abc/gallery/image.jpg
```

if storage is later migrated from:

```text
Neon Object Storage
```

to:

```text
MinIO
```

Only the storage provider configuration/implementation and migration process need to change.

MinIO was considered as a future cost-reduction option, but Neon Object Storage is the current implementation.

## 18. Vercel / staging / production notes

Booksaa uses separate staging and production deployments.

Make sure each deployment environment has the correct storage variables:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_ENDPOINT_URL_S3
AWS_REGION
```

The database connection and Object Storage credentials are separate concerns. Changing the Neon database connection does not automatically change Object Storage configuration.

If staging and production use different Neon storage resources/credentials, configure them independently.

## 19. Troubleshooting

### Upload fails with certificate/endpoint error

Check that the S3 client includes:

```js
forcePathStyle: true
```

This was an important fix in the current Neon setup.

### Image key exists but image does not display

Check:

1. Is the object key correct?
2. Does the object exist in `assets`?
3. Is the bucket private?
4. Does `/api/storage/view` generate a signed URL?
5. Has the signed URL expired?
6. Is the frontend mistakenly treating the key as a public URL?
7. Are the storage environment variables present in the deployed environment?

### Works locally but not on Vercel

Check the four storage environment variables in the exact Vercel environment being deployed.

Also verify that the deployment is using the expected Neon Object Storage endpoint.

### Gallery date filter returns invalid dates

Check whether the storage response includes `lastModified`. If not, don't calculate a date from an undefined value.

## 20. Quick reference

| Item | Current setup |
|---|---|
| Provider | Neon Object Storage |
| API | S3-compatible |
| Bucket | `assets` |
| Visibility | Private |
| Region | `us-east-1` |
| SDK | AWS SDK S3 client |
| Main helper | `lib/storage.js` |
| Important option | `forcePathStyle: true` |
| Database stores | Object key |
| Database should not store | Temporary signed URL |
| Image access | Signed/view URL |
| View API | `/api/storage/view` |
| Business gallery | `form.photos` JSON array |
| Branding path | `vendors/{vendorId}/branding/...` |
| Service path | `vendors/{vendorId}/services/{serviceId}/...` |
| Professional path | `vendors/{vendorId}/professionals/{professionalId}/...` |
| Gallery path | `vendors/{vendorId}/gallery/...` |
| Customer profile path | `customers/{customerId}/profile/...` |
| Future provider | MinIO/other S3-compatible storage possible |

## 21. Core rule

> **Store the object key in Prisma, keep the Neon bucket private, and generate a signed URL whenever the browser needs to display the image.**

The object key is the persistent identity of the image. The signed URL is only a temporary delivery mechanism.
