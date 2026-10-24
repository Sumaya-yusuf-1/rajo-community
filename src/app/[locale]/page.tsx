import {notFound} from 'next/navigation';
import {CommunityApp} from '@/components/CommunityApp';
import type {Locale} from '@/lib/content';
export function generateStaticParams(){return [{locale:'sv'},{locale:'so'}]}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(locale!=='sv'&&locale!=='so')notFound();return <CommunityApp locale={locale as Locale}/>}
