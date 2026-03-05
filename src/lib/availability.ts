/**
 * Build the availability tracker SSO URL (VITE_AVAILABILITY_TRACKER_URL + /sso path + params).
 * Use for redirecting or copying the link when clicking Availability.
 */
const TRACKER_SSO_PATH = "/sso";

export function getAvailabilityTrackerSsoUrl(params: {
  token: string;
  role: string;
  userId: string;
  email?: string;
}): string {
  const base = (import.meta.env.VITE_AVAILABILITY_TRACKER_URL || "").replace(/\/$/, "");
  if (!base) return "";
  const search = new URLSearchParams({
    token: params.token,
    role: params.role,
    userId: params.userId,
  });
  if (params.email) search.set("email", params.email);
  return `${base}${TRACKER_SSO_PATH}?${search.toString()}`;
}
