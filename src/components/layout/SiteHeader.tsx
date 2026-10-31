import UserMenu from "@/components/UserMenu";
import { Globe2, Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";
import MobileMenu from "../MobileMenu";

type SiteHeaderProps = {
  locale: "sv" | "so";
  page: string;
  navItems: string[];
  labels: Record<string, [string, string]>;
  menu: boolean;
  theme: "light" | "dark";
  translate: (swedish: string, somali: string) => string;
  onNavigate: (page: string) => void;
  onMenuChange: (open: boolean) => void;
  onToggleTheme: () => void;
};

export function SiteHeader({
  locale,
  page,
  navItems,
  labels,
  menu,
  theme,
  translate,
  onNavigate,
  onMenuChange,
  onToggleTheme,
}: SiteHeaderProps) {
  return (
    <>
      <header className="site-header rajo-animated-header">
        <div className="header-inner">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="brand"
            aria-label="RAJO home"
          >
            <img src="/images/rajo-logo.jpeg" alt="RAJO Community" />
            <span>
              RAJO <small>COMMUNITY</small>
            </span>
          </button>

          <nav className="main-nav rajo-desktop-nav">
            {navItems.map((item) => (
              <Link
                key={item}
                href={`/${locale}${item === "home" ? "" : `/${item}`}`}
                className={page === item ? "nav-active" : ""}
                onClick={() => onMenuChange(false)}
              >
                {locale === "so" ? labels[item][1] : labels[item][0]}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <div className="language-switch" aria-label={translate("Språk", "Luqadda")}>
              <Globe2 size={15} />
              <Link
                className={locale === "sv" ? "active" : ""}
                href={`/sv${page === "home" ? "" : "/" + page}`}
              >
                SV
              </Link>
              <span>/</span>
              <Link
                className={locale === "so" ? "active" : ""}
                href={`/so${page === "home" ? "" : "/" + page}`}
              >
                SO
              </Link>
            </div>

            <button
              type="button"
              className="theme-toggle rajo-desktop-action"
              onClick={onToggleTheme}
              aria-label={
                theme === "dark" ? "Aktivera ljust tema" : "Aktivera mörkt tema"
              }
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="rajo-desktop-profile hidden lg:flex items-center">
              <UserMenu locale={locale} />
            </div>

            <button
              type="button"
              className="mobile-toggle rajo-mobile-trigger"
              onClick={() => onMenuChange(true)}
              aria-label={locale === "so" ? "Fur liiska" : "Öppna menyn"}
              aria-expanded={menu}
              aria-controls="rajo-mobile-navigation"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        locale={locale}
        open={menu}
        onClose={() => onMenuChange(false)}
        theme={theme}
        toggleTheme={onToggleTheme}
      />
    </>
  );
}
