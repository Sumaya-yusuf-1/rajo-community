"use client";

import UserMenu from "@/components/UserMenu";
import MobileMenu from "@/components/MobileMenu";

import {
  Globe2,
  Menu,
  Moon,
  Sun,
} from "lucide-react";

import Link from "next/link";

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

// Shorter Somali labels for desktop navigation.
// Full translations remain available in labels and MobileMenu.
const somaliNavLabels: Record<string, string> = {
  home: "Bogga Hore",
  moments: "Xusuusaheena",
  activities: "Hawlaha",
  ideas: "Fikrado",
  about: "Nagu Saabsan",
  join: "Ku Biir",
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
  function getNavLabel(item: string) {
    if (locale === "so") {
      return somaliNavLabels[item] ?? labels[item]?.[1] ?? item;
    }

    return labels[item]?.[0] ?? item;
  }

  function getFullNavLabel(item: string) {
    return labels[item]?.[locale === "so" ? 1 : 0] ?? item;
  }

  function getPageUrl(language: "sv" | "so") {
    return `/${language}${page === "home" ? "" : `/${page}`}`;
  }

  return (
    <>
      <header className="site-header rajo-animated-header">
        <div className="header-inner">
          {/* BRAND */}
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="brand shrink-0"
            aria-label={
              locale === "so"
                ? "Bogga hore ee RAJO"
                : "RAJO startsida"
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/rajo-logo.jpeg"
              alt="RAJO Community"
            />

            <span>
              RAJO
              <small>COMMUNITY</small>
            </span>
          </button>

          {/* DESKTOP NAVIGATION */}
          <nav
            className="main-nav rajo-desktop-nav"
            aria-label={translate(
              "Huvudnavigation",
              "Liiska ugu weyn",
            )}
          >
            {navItems.map((item) => (
              <Link
                key={item}
                href={`/${locale}${item === "home" ? "" : `/${item}`}`}
                className={`rajo-nav-link ${
                  page === item ? "nav-active" : ""
                }`}
                aria-label={getFullNavLabel(item)}
                aria-current={page === item ? "page" : undefined}
                onClick={() => onMenuChange(false)}
              >
                {getNavLabel(item)}
              </Link>
            ))}
          </nav>

          {/* HEADER ACTIONS */}
          <div className="header-actions">
            {/* LANGUAGE SWITCH */}
            <div
              className="language-switch"
              aria-label={translate("Språk", "Luqadda")}
            >
              <Globe2 size={15} aria-hidden="true" />

              <Link
                className={locale === "sv" ? "active" : ""}
                href={getPageUrl("sv")}
                aria-label="Svenska"
                aria-current={
                  locale === "sv" ? "page" : undefined
                }
              >
                SV
              </Link>

              <span aria-hidden="true">/</span>

              <Link
                className={locale === "so" ? "active" : ""}
                href={getPageUrl("so")}
                aria-label="Soomaali"
                aria-current={
                  locale === "so" ? "page" : undefined
                }
              >
                SO
              </Link>
            </div>

            {/* THEME BUTTON */}
            <button
              type="button"
              className="theme-toggle rajo-desktop-action"
              onClick={onToggleTheme}
              aria-label={
                theme === "dark"
                  ? translate(
                      "Aktivera ljust tema",
                      "Daar muuqaalka iftiinka",
                    )
                  : translate(
                      "Aktivera mörkt tema",
                      "Daar muuqaalka mugdiga",
                    )
              }
            >
              {theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            {/* USER PROFILE */}
            <div className="rajo-desktop-profile">
              <UserMenu locale={locale} />
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              className="mobile-toggle rajo-mobile-trigger"
              onClick={() => onMenuChange(!menu)}
              aria-label={
                locale === "so"
                  ? menu
                    ? "Xir liiska"
                    : "Fur liiska"
                  : menu
                    ? "Stäng menyn"
                    : "Öppna menyn"
              }
              aria-expanded={menu}
              aria-controls="rajo-mobile-navigation"
            >
              <Menu size={23} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAVIGATION */}
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