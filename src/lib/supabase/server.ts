import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
export async function db(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key) throw new Error('Supabase saknar miljövariabler. Läs README.');
 const jar=await cookies();
 return createServerClient(url,key,{cookies:{getAll(){return jar.getAll()},setAll(items:{name:string;value:string;options?:Parameters<typeof jar.set>[2]}[]){try{items.forEach(({name,value,options})=>jar.set(name,value,options))}catch{/* Server Components cannot write cookies */}}}});
}
export async function currentUser(){const supabase=await db();const {data:{user},error}=await supabase.auth.getUser();return {supabase,user:error?null:user};}
export async function isAdmin(){const {supabase,user}=await currentUser();if(!user)return false;const {data}=await supabase.from('profiles').select('role').eq('id',user.id).single();return data?.role==='admin';}
