import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, STORAGE_BUCKET } from "@/lib/storage";

export function getStorageImageUrl(key, expiresIn = 3600) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: STORAGE_BUCKET, Key: key }), { expiresIn });
}
