import type { Context, Config } from "@netlify/functions";

// Server-side proxy for Google Routes API.
const ORIGIN = {
  latitude: -8.815772755780754,
  longitude: 115.18880418131855
};

const GOOGLE_ROUTES_ENDPOINT = "https://routes.googleapis.com/directions/v2:computeRoutes";

function isValidLatLng(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" && Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
    typeof lng === "number" && Number.isFinite(lng) && lng >= -180 && lng <= 180
  );
}

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export default async (req: Request, context: Context): Promise<Response> => {
  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const apiKey = Netlify.env.get("GOOGLE_ROUTES_API_KEY");
  if (!apiKey) {
    return json(500, { error: "Routing service is not configured (missing GOOGLE_ROUTES_API_KEY)." });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body." });
  }

  const destLat = payload?.destLat;
  const destLng = payload?.destLng;

  if (!isValidLatLng(destLat, destLng)) {
    return json(400, { error: "Invalid or missing destLat/destLng." });
  }

  const requestBody = {
    origin: { location: { latLng: { latitude: ORIGIN.latitude, longitude: ORIGIN.longitude } } },
    destination: { location: { latLng: { latitude: destLat, longitude: destLng } } },
    travelMode: "DRIVE"
  };

  let googleRes: Response;
  try {
    googleRes = await fetch(GOOGLE_ROUTES_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.distanceMeters"
      },
      body: JSON.stringify(requestBody)
    });
  } catch {
    return json(502, { error: "Could not reach the routing provider." });
  }

  if (!googleRes.ok) {
    return json(502, { error: "Routing provider request failed." });
  }

  let data: any;
  try {
    data = await googleRes.json();
  } catch {
    return json(502, { error: "Routing provider returned an invalid response." });
  }

  const route = Array.isArray(data?.routes) ? data.routes[0] : null;
  const distanceMeters = route ? route.distanceMeters : null;

  if (typeof distanceMeters !== "number" || !Number.isFinite(distanceMeters)) {
    return json(502, { error: "No route distance returned by the routing provider." });
  }

  return json(200, { distanceKm: distanceMeters / 1000 });
};

export const config: Config = {
  path: "/api/route-distance"
};
