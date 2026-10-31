import { ArrowRight } from "lucide-react";

type SiteFooterProps = {
  locale: "sv" | "so";
  navItems: string[];
  labels: Record<string, [string, string]>;
  translate: (swedish: string, somali: string) => string;
  onNavigate: (page: string) => void;
};

export function SiteFooter({
  locale,
  navItems,
  labels,
  translate,
  onNavigate,
}: SiteFooterProps) {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <div className="footer-about">
          <div className="footer-brand">
            <img src="/images/rajo-logo.jpeg" alt="RAJO" />
            <span>
              RAJO <small>COMMUNITY</small>
            </span>
          </div>
          <h3>
            {translate(
              "Together we connect, share & grow.",
              "Wadajir ayaan isku xirnaannaa, wadaagnaa oo kornaa.",
            )}
          </h3>
          <p>
            {translate(
              "A space to belong, build friendships and create moments that matter.",
              "Goob saaxiibtinimo iyo xusuus qiimo leh lagu dhiso.",
            )}
          </p>
        </div>
        <div>
          <h4>{translate("Explore", "Sahami")}</h4>
          {navItems.slice(0, 4).map((item) => (
            <button key={item} onClick={() => onNavigate(item)}>
              {locale === "so" ? labels[item][1] : labels[item][0]}
            </button>
          ))}
        </div>
        <div>
          <h4>{translate("Community", "Bulshada")}</h4>
          {navItems.slice(4).map((item) => (
            <button key={item} onClick={() => onNavigate(item)}>
              {locale === "so" ? labels[item][1] : labels[item][0]}
            </button>
          ))}
          <button onClick={() => onNavigate("admin")}>Admin preview</button>
        </div>
        <div className="footer-news">
          <h4>{translate("Stay connected", "Nala soco")}</h4>
          <p>
            {translate(
              "Our best moments are still ahead.",
              "Waqtiyadeennii ugu fiicnaa way soo socdaan.",
            )}
          </p>
          <button className="btn-white" onClick={() => onNavigate("join")}>
            {translate("Get involved", "Ka qayb qaado")} <ArrowRight size={17} />
          </button>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © 2026 RAJO Community ·{" "}
          {translate("Made for connection", "Waxaa loo sameeyay isku xirnaan")}
        </span>
        <span className="footer-legal">
          <button onClick={() => onNavigate("terms")}>
            {translate("Terms of Use", "Shuruudaha Isticmaalka")}
          </button>
          <button onClick={() => onNavigate("privacy")}>
            {translate("Privacy Policy", "Siyaasadda Asturnaanta")}
          </button>
        </span>
        <span>CONNECT · SHARE · GROW</span>
      </div>
    </footer>
  );
}
