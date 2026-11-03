import { ShieldCheck } from "lucide-react";

type Props = {
  locale: "sv" | "so";
};

const rules = [
  ["Respektera allas åsikter.", "Ixtira aragtida qof kasta."],
  ["Avbryt inte andra som pratar.", "Ha ka dhex gelin dadka kale marka ay hadlayaan."],
  ["Prata svenska, somaliska eller båda språken.", "Ku hadal af Iswiidhish, Soomaali ama labadaba."],
  ["Håll dig till ämnet.", "Mawduuca ku ekaaw."],
  ["Max två minuter per talartur.", "Qof kasta waxa uu hadli karaa ugu badnaan laba daqiiqo mar kasta."],
  ["Döm eller förlöjliga inte andra.", "Ha xukumin ama ha ku jeesjeesin dadka kale."],
  ["Respektera deltagarnas integritet.", "Ixtiraam sirta iyo asturnaanta ka qaybgalayaasha."],
  ["Inga inspelningar eller skärmdumpar utan tillstånd.", "Ha duubin ama ha qaadin sawirro shaashad ah oggolaansho la’aan."],
  ["Deltagandet är frivilligt – det är också välkommet att lyssna.", "Ka qaybqaadashadu waa ikhtiyaari; dhageysigu sidoo kale waa soo dhawayn."],
] as const;

export function TalkRules({ locale }: Props) {
  const somali = locale === "so";

  return (
    <section className="rajo-talk-rules" aria-labelledby="rajo-talk-rules-title">
      <div className="rajo-talk-rules-heading">
        <ShieldCheck size={25} aria-hidden="true" />
        <div>
          <span className="eyebrow">{somali ? "XEERARKA" : "REGLER"}</span>
          <h2 id="rajo-talk-rules-title">
            {somali ? "Sida RAJO Talk u shaqeeyo" : "Så fungerar RAJO Talk"}
          </h2>
        </div>
      </div>
      <p className="rajo-talk-language-note">
        {somali
          ? "Ka qaybgalayaashu waxay ku hadli karaan af Iswiidhish, Soomaali ama labadaba. Qofna looma baahna inuu si qumman u hadlo. Haddii loo baahdo, dhexdhexaadiyayaashu waxay si kooban ugu soo koobayaan waxyaabaha muhiimka ah labada luuqadood."
          : "Deltagarna får prata svenska, somaliska eller båda språken. Ingen måste prata perfekt. Moderatorerna sammanfattar vid behov viktiga bidrag kort på båda språken."}
      </p>
      <ol className="rajo-talk-rules-list">
        {rules.map(([swedish, somaliText], index) => (
          <li key={swedish}>
            <span>{index + 1}</span>
            <p>{somali ? somaliText : swedish}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
