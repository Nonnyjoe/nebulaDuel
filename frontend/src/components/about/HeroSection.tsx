import PageHero from "../shared/PageHero";

const HeroSection = () => (
  <PageHero
    kicker="The story behind the duel"
    title="About"
    accent="NebulaDuel"
    subtitle="A fully on-chain auto-battler powered by Cartesi Rollups — every fight is computed deterministically inside a verifiable machine."
    crumbs={[{ label: "Home", path: "/" }, { label: "About us" }]}
  />
);

export default HeroSection;
