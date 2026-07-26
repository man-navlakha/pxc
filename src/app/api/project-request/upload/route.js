import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { ApiError, jsonError, requireUser } from "@/server/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function safeFilename(filename) {
  const parsed = path.parse(String(filename || "requirement"));
  const name = parsed.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "requirement";
  const ext = parsed.ext.toLowerCase().replace(/[^a-z0-9.]/g, "");
  return `${name}${ext}`;
}

export async function POST(request) {
  try {
    const currentUser = await requireUser(request);
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((file) => file && typeof file.arrayBuffer === "function");

    if (!files.length) {
      return NextResponse.json({ files: [] });
    }

    const uploadRoot = path.join(
      process.cwd(),
      "public",
      "project-requirements",
      currentUser.username
    );
    await mkdir(uploadRoot, { recursive: true });

    const uploadedFiles = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        throw new ApiError(400, "Only PDF and image files are allowed.");
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new ApiError(400, "Each file must be 8 MB or smaller.");
      }

      const storedName = `${Date.now()}-${randomUUID()}-${safeFilename(file.name)}`;
      const destination = path.join(uploadRoot, storedName);
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(destination, bytes);

      uploadedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        url: `/project-requirements/${currentUser.username}/${storedName}`,
      });
    }

    return NextResponse.json({ files: uploadedFiles });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
