import {NextResponse} from 'next/server';import {currentUser} from '@/lib/supabase/server';
export async function POST(_req:Request,{params}:{params:Promise<{id:string}>}){try{
 const {id}=await params;const {supabase,user}=await currentUser();if(!user)return NextResponse.json({error:'Login required'},{status:401});
 const {error}=await supabase.from('idea_votes').insert({idea_id:id,user_id:user.id});if(error)return NextResponse.json({error:error.code==='23505'?'Already voted':'Voting unavailable'},{status:error.code==='23505'?409:400});return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:'Voting failed'},{status:500})}}
