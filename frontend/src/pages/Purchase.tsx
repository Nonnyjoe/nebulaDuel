import PurchaseCharacter from "../components/profile/PurchaseCharacter"
import MaxWrapper from "../components/shared/MaxWrapper"


const Purchase = () => {
    return (
        <main className="w-full flex flex-col">
            <MaxWrapper className="w-full px-4 md:px-6 lg:px-8">
                <PurchaseCharacter />
            </MaxWrapper>
        </main>
    )
}

export default Purchase

