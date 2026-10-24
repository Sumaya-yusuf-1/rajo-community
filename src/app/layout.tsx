import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'RAJO Community | Connect · Share · Grow',description:'RAJO är en gemenskap för alla från 18 år, med aktiviteter, idéer och nya vänskaper.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="sv"><body>{children}</body></html>}
