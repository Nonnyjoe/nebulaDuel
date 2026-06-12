import PageHero from "../shared/PageHero";

const HeroSection = () => (
  <PageHero
    kicker="Open a channel"
    title="Contact"
    accent="the Nebula"
    subtitle="Questions, bug reports, or duel challenges — our channel is always open."
    crumbs={[{ label: "Home", path: "/" }, { label: "Contact us" }]}
  />
);

export default HeroSection;
