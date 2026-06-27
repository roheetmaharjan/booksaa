import { DeleteObjectsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import { nanoid } from "nanoid";
import path from "path";

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucket = process.env.CLOUDFLARE_R2_BUCKET;
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
const localUploadRoot = path.join(process.cwd(), "public", "uploads");

function isR2Configured() {
  return Boolean(accountId && accessKeyId && secretAccessKey && bucket && publicUrl);
}

function getClient() {
  if (!isR2Configured()) {
    throw new Error("Cloudflare R2 is not configured.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function extensionFromFile(file) {
  const fromName = file.name?.split(".").pop();
  const ext = fromName || file.type?.split("/").pop() || "jpg";
  return ext.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
}

function normalizeFolder(folder) {
  return String(folder || "uploads")
    .split("/")
    .map((part) => part.replace(/[^a-zA-Z0-9._-]/g, "-"))
    .filter(Boolean)
    .join("/");
}

async function uploadImageLocally(file, folder = "uploads") {
  const ext = extensionFromFile(file);
  const safeFolder = normalizeFolder(folder);
  const key = `${safeFolder}/${nanoid()}.${ext}`;
  const destination = path.resolve(localUploadRoot, key);

  if (!destination.startsWith(path.resolve(localUploadRoot) + path.sep)) {
    throw new Error("Invalid upload path.");
  }

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, Buffer.from(await file.arrayBuffer()));

  return {
    key,
    url: `/uploads/${key}`,
    name: file.name || key.split("/").pop(),
    size: file.size,
    type: file.type,
  };
}

async function deleteImagesLocally(keys = []) {
  const uploadRoot = path.resolve(localUploadRoot);

  await Promise.all(
    keys.map(async (key) => {
      const target = path.resolve(uploadRoot, String(key).replace(/^\/?uploads\//, ""));
      if (!target.startsWith(uploadRoot + path.sep)) return;

      try {
        await fs.unlink(target);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    })
  );
}

export function assertImageFile(file) {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!file || typeof file === "string") {
    throw new Error("No image file received.");
  }
  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid image type.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image too large. Maximum size is 5MB.");
  }
}

export async function uploadImageToR2(file, folder = "uploads") {
  assertImageFile(file);

  if (!isR2Configured()) {
    return uploadImageLocally(file, folder);
  }

  const client = getClient();
  const ext = extensionFromFile(file);
  const safeFolder = normalizeFolder(folder);
  const key = `${safeFolder}/${nanoid()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  return {
    key,
    url: `${publicUrl.replace(/\/$/, "")}/${key}`,
    name: file.name || key.split("/").pop(),
    size: file.size,
    type: file.type,
  };
}

export async function deleteImagesFromR2(keys = []) {
  const uniqueKeys = [...new Set(keys.filter(Boolean))];
  if (uniqueKeys.length === 0) return;

  if (!isR2Configured()) {
    await deleteImagesLocally(uniqueKeys);
    return;
  }

  const client = getClient();

  await client.send(
    new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: uniqueKeys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    })
  );
}
