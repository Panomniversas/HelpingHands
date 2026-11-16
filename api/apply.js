import { db } from "hatchable";
export const access = "public";
export const methods = ["POST"];
export default async function (req, res) {
 const b = req.body || {};
 const name = String(b.full_name || '').trim(); const email = String(b.email || '').trim().toLowerCase(); const country = String(b.country || '').trim(); const situation = String(b.situation || '').trim(); const amount = Math.round(Number(b.amount) * 100);
 if (!name || !email.includes('@') || !country || situation.length < 30 || !Number.isSafeInteger(amount) || amount < 100 || amount > 100000000 || b.consent !== true) return res.status(400).json({ error: 'Please complete all fields. Explain your situation in at least 30 characters and request at least 1 unit of currency.' });
 const { rows } = await db.query("INSERT INTO hardship_applications (full_name,email,country,amount_cents,situation,consent) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",[name,email,country,amount,situation,true]);
 res.status(201).json({ ok:true, reference: rows[0].id, message:'Application received for private review. Submission is not a guarantee of assistance.' });
}