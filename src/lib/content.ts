export type Locale = 'sv' | 'so';
export const locales: Locale[] = ['sv', 'so'];
export const tr = (locale: Locale, english: string, somali: string) => locale === 'so' ? somali : english;
export const photos = {
 hero:'/images/rajo-hero.jpg',
 friends:'/images/temp_image_DC31FD30-377C-49CD-BACE-0A2B18A01966.WEBP',
 picnic:'/images/temp_image_0B9EBC95-95EA-4CE3-BD06-B4ECE49C2AA7%20(1).WEBP',
 girls:'/images/temp_image_336358BE-0EB6-464B-B93F-03D0F8E2BE92%20(1).WEBP',
 games:'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1000&q=85',
 coffee:'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=85',
 learn:'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=85',
 city:'https://images.unsplash.com/photo-1499540633125-484965b60031?auto=format&fit=crop&w=1100&q=85'
};
export const events = [
 {id:1,title:'RAJO spelkväll online',so:'Habeenka Ciyaaraha RAJO',date:'25 Oct 2026',where:'Online',type:'Online',image:photos.games,description:'Spel, skratt och chans att träffa nya vänner.',descriptionSo:'Ciyaaro, qosol iyo fursad aad saaxiibo cusub ku baran karto.'},
 {id:2,title:'RAJO Sisters – fika & gemenskap',so:'Kulanka Qaxwada Gabdhaha',date:'5 Nov 2026',where:'Gothenburg',type:'RAJO Sisters',image:photos.coffee,description:'En avslappnad träff för gemenskap och idéer.',descriptionSo:'Goob degan oo la isku barto laguna wadaago fikrado.'},
 {id:3,title:'Idékväll med RAJO',so:'Wadaagista Fikradaha Bulshada',date:'12 Nov 2026',where:'Online',type:'Workshop',image:photos.learn,description:'Var med och påverka vad vi gör tillsammans härnäst.',descriptionSo:'Naga caawi qorshaynta hawlaha xiga.'}
];
export type Moment = {
  id: string | number;
  title: string;
  so: string;
  date: string;
  location: string;
  category: string;
  image: string;
  description_sv?: string;
  description_so?: string;
};
export const moments: Moment[] = [
 {id:'sample-1',title:'Gemenskapsträff',so:'Kulankii Bulshada',date:'Aug 2026',location:'Gothenburg',category:'Meetups',image:photos.friends},
 {id:'sample-2',title:'En eftermiddag tillsammans',so:'Galab Wadajir Ah',date:'Jul 2026',location:'Gothenburg',category:'Meetups',image:photos.picnic},
 {id:'sample-3',title:'Vänner & samtal',so:'Saaxiibbo iyo Wadahadal',date:'Jun 2026',location:'Online & local',category:'Community',image:photos.girls},
 {id:'sample-4',title:'Spel och gemenskap',so:'Ciyaaro iyo Farxad',date:'May 2026',location:'Online',category:'Activities',image:photos.games},
 {id:'sample-5',title:'Fika och gemenskap',so:'Qaxwo iyo Isbarasho',date:'Apr 2026',location:'Gothenburg',category:'RAJO Sisters',image:photos.coffee},
 {id:'sample-6',title:'Vi lär tillsammans',so:'Waxbarasho Wadajir Ah',date:'Mar 2026',location:'Online',category:'Workshops',image:photos.learn}
];
export type Idea = {id:string;title:string;description:string;category:string;votes:number;status:'pending'|'approved'|'rejected';created:string};
export const starterIdeas: Idea[] = [
 {id:'starter-1',title:'Somalisk matlagningsworkshop',description:'Lär oss recept och laga mat tillsammans.',category:'Workshop',votes:24,status:'approved',created:'2026-10-10'},
 {id:'starter-2',title:'En dagsutflykt tillsammans',description:'Upptäck en ny plats och skapa fina minnen.',category:'Outdoors',votes:19,status:'approved',created:'2026-10-12'},
 {id:'starter-3',title:'Digital bokcirkel',description:'Läs tillsammans och dela tankar.',category:'Online',votes:16,status:'approved',created:'2026-10-14'}
];
