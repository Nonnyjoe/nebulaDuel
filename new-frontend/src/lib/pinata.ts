/**
 * Avatar uploads via Pinata (IPFS). Keys come from VITE_PINATA_* env.
 *
 * NOTE: the legacy api-key/secret pair ships to the browser bundle. That's fine
 * for a hackathon/dev key, but for production use a scoped JWT behind a small
 * server function instead of a long-lived secret.
 */
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY as string | undefined;
const PINATA_SECRET = import.meta.env.VITE_PINATA_SECRET_API_KEY as string | undefined;
const GATEWAY = "https://gateway.pinata.cloud/ipfs/";

export function pinataConfigured(): boolean {
  return !!PINATA_API_KEY && !!PINATA_SECRET;
}

/** Pin an image to IPFS and return its public gateway URL. */
export async function uploadToPinata(file: File): Promise<string> {
  if (!pinataConfigured()) {
    throw new Error("Image uploads are not configured (set VITE_PINATA_* env).");
  }
  const form = new FormData();
  form.append("file", file);
  form.append(
    "pinataMetadata",
    JSON.stringify({ name: `nebula-avatar-${Date.now()}` }),
  );

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY!,
      pinata_secret_api_key: PINATA_SECRET!,
    },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Pinata upload failed (${res.status}): ${text.slice(0, 120)}`);
  }
  const json = await res.json();
  if (!json?.IpfsHash) throw new Error("Pinata returned no IpfsHash");
  return `${GATEWAY}${json.IpfsHash}`;
}
