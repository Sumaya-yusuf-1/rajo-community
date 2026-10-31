import { ArrowRight, CheckCircle2, Users } from "lucide-react";
import { photos } from "@/lib/content";
import { PageHero } from "@/components/shared/PageHero";
import { BenefitList } from "./BenefitList";

type Props = {
  t: (swedish: string, somali: string) => string;
  notice: string;
  join: (form: FormData) => Promise<void>;
  navigate: (page: string) => void;
};

export function MembershipPageContent({ t, notice, join, navigate }: Props) {
  return (
<>
    <PageHero
      tag={t("YOUR PLACE IS HERE", "MEESHAADII WAA TAN")}
      title={t(
        "Come as you are. Belong as you are.",
        "Sida aad tahay ku imow, nagu soo biir.",
      )}
      description={t(
        "New friendships, meaningful conversations and a community that welcomes you.",
        "Saaxiibo cusub, wada sheekaysi macno leh iyo bulsho ku soo dhawaynaysa.",
      )}
      image={photos.hero}
    />
    <section className='section container join-layout'>
      <div>
        <span className='eyebrow'>
          {t("BECOME PART OF RAJO", "KA MID NOQO RAJO")}
        </span>
        <h2 className='subpage-title'>
          {t(
            "Your next chapter starts here.",
            "Cutubkaaga xiga halkan ayuu ka bilaabmaa.",
          )}
        </h2>
        <p>
          {t(
            "You don’t need to know anyone to join. Just bring your curiosity and a willingness to connect.",
            "Uma baahnid inaad qof hore u taqaan. Kaliya keen rabitaankaaga isbarasho.",
          )}
        </p>
        <BenefitList
          benefits={[
            t(
              "Meet new people and make friends",
              "La kulan dad cusub oo saaxiibo yeelo",
            ),
            t(
              "Join fun online and in-person activities",
              "Ka qaybgal kulamada internetka iyo kuwa fool-ka-foolka ah",
            ),
            t(
              "Share ideas that shape our future",
              "La wadaag fikrado mustaqbalka dhisaya",
            ),
            t(
              "Learn, grow and support each other",
              "Wax baro, horumar samee oo is taageera",
            ),
          ]}
        />
        <div className='join-info'>
          <Users />
          <div>
            <b>
              {t(
                "Everyone aged 18+ is welcome",
                "Qof kasta oo 18 jir ah ama ka weyn waa soo dhow yahay",
              )}
            </b>
            <p>
              {t(
                "Based in Gothenburg, with online ways to connect too.",
                "Göteborg ayaan ku saleysannahay, kulamo internetka ahna way jiraan.",
              )}
            </p>
          </div>
        </div>
      </div>
      <div className='form-panel'>
        <span className='eyebrow'>
          {t("INTEREST FORM", "FOOMKA XIISAHA")}
        </span>
        <h2>{t("Join the community", "Ku biir bulshada")}</h2>
        <p>
          {t(
            "Tell us a little about yourself.",
            "Wax yar nooga sheeg naftaada.",
          )}
        </p>
        <form className='stacked-form' key={notice} action={join}>
          <label>
            {t("Your name", "Magacaaga")}
            <input
              required
              minLength={2}
              name='name'
              placeholder={t("Full name", "Magaca oo dhan")}
            />
          </label>
          <label>
            {t("Email address", "Cinwaanka iimaylka")}
            <input
              required
              type='email'
              name='email'
              placeholder='you@example.com'
            />
          </label>
          <label>
            {t(
              "What interests you most?",
              "Maxaa aad ugu xiiso badan?",
            )}
            <select name='interest'>
              <option>Community activities</option>
              <option>Online events</option>
              <option>RAJO Sisters</option>
              <option>Workshops & learning</option>
            </select>
          </label>
          {/* Telefonnummer */}
<label>
  {t("Telefonnummer", "Lambarka telefoonka")}

  <input
    type="tel"
    name="phone"
    required
    autoComplete="tel"
    placeholder="+46 70 123 45 67"
    className="w-full"
  />
</label>
          <label className='consent'>
            <input required type='checkbox' name='adult' />
            {t(
              "I confirm that I am at least 18 years old.",
              "Waxaan xaqiijinayaa inaan ugu yaraan 18 jir ahay.",
            )}
          </label>
          <label className='consent'>
            <input required type='checkbox' name='agreeTerms' />
            {t(
              "I have read and agree to the Terms of Use and Privacy Policy.",
              "Waxaan akhriyey oo aqbalay Shuruudaha Isticmaalka iyo Siyaasadda Asturnaanta.",
            )}
          </label>
          <label className="consent">
  <input
    type="checkbox"
    name="contactConsent"
    required
  />

  <span>
    {t(
      "Jag godkänner att RAJO kontaktar mig angående min medlemsansökan.",
      "Waxaan oggolahay in RAJO ila soo xiriirto arrimaha codsigayga xubinnimada."
    )}
  </span>
</label>
          <label className="consent">
  <input
    type="checkbox"
    name="whatsappConsent"
  />

  <span>
    {t(
      "Jag godkänner att RAJO kontaktar mig via WhatsApp om medlemskap och aktiviteter.",
      "Waxaan oggolahay in RAJO igala soo xiriirto WhatsApp arrimaha xubinnimada iyo hawlaha."
    )}
  </span>
</label>
          <div className='policy-links'>
            <button type='button' onClick={() => navigate("terms")}>
              {t("Read Terms of Use", "Akhri Shuruudaha")}
            </button>
            <button type='button' onClick={() => navigate("privacy")}>
              {t("Read Privacy Policy", "Akhri Siyaasadda Asturnaanta")}
            </button>
          </div>
          
          <button className='btn-primary full' type='submit'>
            {t("Send my interest", "Dir codsigayga")}{" "}
            <ArrowRight size={16} />
          </button>
        </form>
        {notice && (
          <p className='form-notice'>
            <CheckCircle2 size={18} />
            {notice}
          </p>
        )}
        <small className='muted'>
          {t(
            "Demo only: submissions stay in your browser. No email is sent.",
            "Tijaabo keliya: xogtu waxay ku jirtaa browser-kaaga. Iimayl lama dirayo.",
          )}
        </small>
      </div>
    </section>
  </>
  );
}
