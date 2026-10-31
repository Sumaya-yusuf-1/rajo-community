import {NextResponse} from 'next/server';
import {currentUser} from '@/lib/supabase/server';
export async function GET(){try{const {supabase,user}=await currentUser();const {data,error}=await supabase.from('ideas').select('id,title,description,category,status,created_at,vote_count').eq('status','approved').order('vote_count',{ascending:false});if(error)throw error;let votedIds:string[]=[];if(user){const {data:votes,error:votesError}=await supabase.from('idea_votes').select('idea_id').eq('user_id',user.id);if(votesError)throw votesError;votedIds=(votes||[]).map((vote)=>vote.idea_id)}return NextResponse.json({data,votedIds})}catch{return NextResponse.json({error:'Database unavailable'},{status:503})}}
export async function POST(req:Request){try{
 const {supabase,user}=await currentUser();if(!user)return NextResponse.json({error:'Login required'},{status:401});
 const body=await req.json();const title=String(body.title||'').trim(),description=String(body.description||'').trim(),category=String(body.category||'Community').slice(0,50);
 if(title.length<4||title.length>120||description.length<10||description.length>2000)return NextResponse.json({error:'Invalid title or description'},{status:400});
 const {data,error}=await supabase.from('ideas').insert({title,description,category,author_id:user.id}).select('id').single();if(error)throw error;
 return NextResponse.json({data,message:'Idea awaiting moderation'},{status:201});
 }catch{return NextResponse.json({error:'Unable to submit idea'},{status:500})}}
