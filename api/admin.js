import { db } from "hatchable";
export const access = "admin";
export const methods = ["GET","POST"];
export default async function(req,res){
 if(req.method==='GET'){
  const [apps,pledges,campaigns]=await Promise.all([db.query("SELECT id,full_name,email,country,amount_cents,situation,status,created_at FROM hardship_applications ORDER BY created_at DESC LIMIT 100"),db.query("SELECT id,campaign_id,donor_name,donor_email,amount_cents,currency,status,created_at FROM donation_pledges ORDER BY created_at DESC LIMIT 100"),db.query("SELECT id,title,country,goal_cents,raised_cents,status,created_at FROM campaigns ORDER BY created_at DESC LIMIT 100")]);
  return res.json({applications:apps.rows,pledges:pledges.rows,campaigns:campaigns.rows});
 }
 const b=req.body||{}; const action=String(b.action||'');
 if(action==='create_campaign'){
  const title=String(b.title||'').trim(),story=String(b.story||'').trim(),country=String(b.country||'').trim(),goal=Math.round(Number(b.goal)*100);
  if(!title||story.length<40||!country||!Number.isSafeInteger(goal)||goal<100)return res.status(400).json({error:'Provide a title, country, a story of at least 40 characters, and a valid goal.'});
  const {rows}=await db.query("INSERT INTO campaigns(title,story,country,goal_cents,status) VALUES($1,$2,$3,$4,'approved') RETURNING id",[title,story,country,goal]);return res.status(201).json({ok:true,id:rows[0].id});
 }
 if(action==='review_application'){
  if(!b.id||!['approved','rejected'].includes(b.status))return res.status(400).json({error:'Invalid review action.'});
  await db.query("UPDATE hardship_applications SET status=$1 WHERE id=$2",[b.status,b.id]);return res.json({ok:true});
 }
 if(action==='confirm_pledge'){
  if(!b.id)return res.status(400).json({error:'Pledge ID required.'});
  const p=await db.query("UPDATE donation_pledges SET status='confirmed' WHERE id=$1 AND status IN ('pledged','payment_pending') RETURNING campaign_id,amount_cents",[b.id]);
  if(!p.rows.length)return res.status(404).json({error:'Pledge not found or already processed.'});
  if(p.rows[0].campaign_id)await db.query("UPDATE campaigns SET raised_cents=raised_cents+$1 WHERE id=$2",[p.rows[0].amount_cents,p.rows[0].campaign_id]);return res.json({ok:true});
 }
 return res.status(400).json({error:'Unknown action.'});
}