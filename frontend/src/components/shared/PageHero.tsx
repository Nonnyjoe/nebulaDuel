/**
 * PageHero — the standard page header band: cosmic gradient, scanline grid,
 * kicker, headline (with optional aurora word), subtitle and breadcrumb.
 */
import React from "react";
import { Link } from "react-router-dom";

interface Crumb {
  label: string;
  path?: string;
}

interface Props {
  kicker?: string;
  title: string;
  /** Optional last word(s) rendered with the animated aurora gradient */
  accent?: string;
  subtitle?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
  compact?: boolean;
}

const PageHero: React.FC<Props> = ({
  kicker,
  title,
  accent,
  subtitle,
  crumbs,
  children,
  compact,
}) => (
  <section className={`page-hero w-full ${compact ? "py-10 md:py-12" : "py-14 md:py-20"}`}>
    <div className="hero-grid" />
    <div className="relative max-w-[1200px] mx-auto px-4 md:px-8 text-center">
      {crumbs && (
        <nav className="reveal-up d1 flex items-center justify-center gap-2 mb-4 text-[11px] font-belanosima uppercase tracking-widest">
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="w-1 h-1 rounded-full bg-myGreen/60" />}
              {c.path ? (
                <Link to={c.path} className="text-gray-400 hover:text-myGreen transition-colors">
                  {c.label}
                </Link>
              ) : (
                <span className="text-myGreen">{c.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      {kicker && (
        <p className="reveal-up d1 font-belanosima uppercase tracking-[0.45em] text-myGreen text-[11px] md:text-xs mb-3">
          {kicker}
        </p>
      )}
      <h1 className="reveal-up d2 font-belanosima uppercase text-3xl md:text-5xl text-white leading-tight">
        {title} {accent && <span className="text-aurora">{accent}</span>}
      </h1>
      {subtitle && (
        <p className="reveal-up d3 font-poppins text-gray-400 text-sm md:text-base max-w-2xl mx-auto mt-4">
          {subtitle}
        </p>
      )}
      {children && <div className="reveal-up d4 mt-6">{children}</div>}
    </div>
  </section>
);

export default PageHero;
