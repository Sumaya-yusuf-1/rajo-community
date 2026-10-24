# RAJO Community — Svenska / Soomaali

Next.js + TypeScript, dark/light, animationer, publika sidor och Supabase-backend.

## Kom igång

```bash
npm install
cp .env.example .env.local
npm run dev
```

1. Skapa ett Supabase-projekt på supabase.com.
2. Hämta **Project URL** och **anon/publishable key** och fyll i `.env.local`. Lägg **aldrig** en service-role/secret-key i NEXT_PUBLIC-variabler.
3. Öppna Supabase → SQL Editor och kör `supabase/schema.sql` **en gång i ett nytt projekt** (skriptet är inte en komplett upprepningsbar migration).
4. Slå på e-postbekräftelse i Supabase Auth, lägg till lokala och publika URL:er under URL Configuration / Redirect URLs.
5. Registrera ett konto via `/sv/login`, verifiera e-post. Kör sedan följande en gång i Supabase SQL Editor med **din riktiga e-post** för att bevilja adminrollen:

```sql
update public.profiles set role='admin'
where id=(select id from auth.users where email='DIN_EPOST@EXEMPEL.SE');
```

6. Besök `/sv/admin` eller `/so/admin`. Utan rätt roll blir det 403.
7. Besök `/sv/member` eller `/so/member` för att lägga till idéer, rösta och anmäla dig till aktiviteter.

## API

* `GET /api/activities`, `GET /api/moments`, `GET /api/ideas`: publikt publicerat innehåll (tomt innan du skapar det i admin).
* `POST /api/ideas`: inloggade medlemmar kan föreslå idéer (väntar på godkännande).
* `POST /api/ideas/{id}/vote`: kräver inloggning, max en röst per person.
* `POST /api/activities/{id}/register`: kräver inloggning, respekterar platstak.
* `POST /api/membership`: inloggat formulär med 18+-bekräftelse och villkorsgodkännande.
* `/api/admin/{activities|moments|ideas|membership_requests}`: skyddade adminanrop med GET, POST (aktiviteter/minnen), PATCH och DELETE.

**Viktigt:** Publika sidor visar fortfarande exempeldata för design/animation. Inloggad medlemssida och admin använder Supabase. Koppla publika visningen till API-data innan lansering. RAJO:s integritetspolicy är utkast och måste uppdateras för verklig behandling av uppgifter. Ha dokumenterat bildsamtycke innan publicering. Ingen betalning eller realtidschatt finns ännu.
