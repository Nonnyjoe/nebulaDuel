import Market from "../components/marketPlace/Market"
import PageHero from "../components/shared/PageHero"
import MaxWrapper from "../components/shared/MaxWrapper"


const MarketPlace = () => {
    return (
        <main className="w-full flex flex-col">
            <PageHero
        kicker="The Nebula Bazaar"
        title="Market"
        accent="place"
        subtitle="Trade battle-hardened warriors with other players, recruit fresh recruits with points or CTSI, and stock your satchel with battle charms."
        crumbs={[{ label: "Home", path: "/" }, { label: "Marketplace" }]}
      />
            <MaxWrapper className="w-full px-4 md:px-6 lg:px-8">
                <Market />
            </MaxWrapper>
        </main>
    )
}

export default MarketPlace