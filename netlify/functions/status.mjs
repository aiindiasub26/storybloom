// GET /api/status → what the website should offer right now (waitlist, founding price, regular price).
import { offer, json } from "../lib/core.mjs";

export default async () => json(await offer());
export const config = { path: "/api/status" };
