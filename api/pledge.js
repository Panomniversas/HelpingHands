import { db } from "hatchable";
export const access = "public";
export const methods = ["POST"];
export default async function (req, res) {
 const b=req.body||{}; const email=String(b.email||'').trim().toLowerCase(); const name=String(b.name||'').trim(); const message=String(b.message||'').trim().slice(0,500); const currency=String(b.currency||'USD').toUpperCase(); const amount=Math.round(Number(b.amount)*100); const campaignId=b.campaign_id||null;
 if(!email.includes('@')||!Number.isSafeInteger(amount)||amount<100||amount>100000000||!['USD','PHP','EUR','GBP','CAD','AUD','SGD'].includes(currency)) return res.status(400).json({error:'Enter a valid email, supported currency, and amount of at least 1.'});
 if(campaignId){const c=await db.query("SELECT id FROM campaigns WHERE id=$1 AND status='approved'",[campaignId]);if(!c.rows.length)return res.status(400).json({error:'That campaign is not available.'});}
 const {rows}=await db.query("INSERT INTO donation_pledges (campaign_id,donor_name,donor_email,amount_cents,currency,message) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",[campaignId,name,email,amount,currency,message]);
 res.status(201).json({ok:true,reference:rows[0].id,status:'pledged',message:'Your pledge is recorded, not yet charged. A payment method will be provided once the organization completes payment-provider setup.'});
}