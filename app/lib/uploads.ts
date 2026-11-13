import config from "~/config";
import type { Attachment } from "~/utils/types";

/** Types the API accepts (see talktous-api uploads.broker ALLOWED_TYPES). */
export const ACCEPTED_FILE_TYPES =
  "image/png,image/jpeg,image/gif,image/webp,application/pdf,text/plain,text/csv,application/zip," +
  "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document," +
  "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const MAX_FILE_MB = 10;

/**
 * Upload one file to the API. `token` is the dashboard session token or a
 * widget customer token. Returns the attachment to send with a message.
 */
export const uploadFile = async (file: File, token: string): Promise<Attachment> => {
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    throw new Error(`${file.name} is larger than ${MAX_FILE_MB} MB`);
  }
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${config.apiUri}/api/v1/uploads`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body,
  });
  const data = (await response.json().catch(() => ({}))) as Attachment & {
    error?: { message?: string };
  };
  if (!response.ok) throw new Error(data.error?.message ?? `Couldn't upload ${file.name}`);
  return { url: data.url, name: data.name, contentType: data.contentType ?? null, size: data.size ?? null };
};

export const isImage = (attachment: Pick<Attachment, "contentType" | "name">) =>
  attachment.contentType?.startsWith("image/") ?? /\.(png|jpe?g|gif|webp)$/i.test(attachment.name);

export const formatBytes = (size: number | null | undefined) => {
  if (!size) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};
