import { db } from "hatchable";
export const access = "public";
export const methods = ["GET"];
export default async function (req, res) {
 const { rows } = await db.query("SELECT id, title, story, country, goal_cents, raised_cents, created_at FROM campaigns WHERE status = 'approved' ORDER BY created_at DESC LIMIT 50");
 res.json({ campaigns: rows });
}