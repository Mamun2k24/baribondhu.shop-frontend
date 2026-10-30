
const backendBase = (
  import.meta.env.VITE_APP_SERVER_URL || ""
).replace(/\/$/, "");

export const CAMPAIGN_API_URL = (
  import.meta.env.VITE_CAMPAIGN_API_URL ||
  `${backendBase}/api/campaigns`
).replace(/\/$/, "");

// Campaign poster image URL
export function campaignImageUrl(path) {
  if (!path) return "";

  const value = String(path).trim();

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const assetBase = (
    import.meta.env.VITE_ASSET_BASE_URL ||
    backendBase
  ).replace(/\/$/, "");

  return `${assetBase}/${value.replace(/^\//, "")}`;
}

// Public API requests
export async function fetchJson(url, { signal } = {}) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

// Admin Campaign API
export async function campaignAdminRequest(
  path = "",
  { method = "GET", data, signal } = {}
) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${CAMPAIGN_API_URL}/admin${path}`,
    {
      method,
      signal,
      credentials: "include",
      headers: {
        ...(data !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
      ...(data !== undefined
        ? { body: JSON.stringify(data) }
        : {}),
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      result?.message ||
      `Request failed (HTTP ${response.status})`
    );

    error.status = response.status;
    error.errors = result?.errors || {};

    throw error;
  }

  return result;
}

// Campaign poster upload to Backend -> ImgBB
export async function uploadCampaignImage(file) {
  if (!file) {
    throw new Error("Please select an image");
  }

  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `${CAMPAIGN_API_URL}/admin/upload-poster`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
      body: formData,
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result?.message ||
      `Poster upload failed (HTTP ${response.status})`
    );
  }

  if (!result?.imageUrl) {
    throw new Error(
      "Upload completed without an image URL"
    );
  }

  return result.imageUrl;
}
