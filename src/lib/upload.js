import { base44 } from "@/api/base44Client";

export async function uploadImage(file) {
  const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
  return file_url;
}