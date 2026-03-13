import ChooseStrategy from "../components/strategy/ChooseStrategy"
import MaxWrapper from "../components/shared/MaxWrapper"


const Strategy = () => {
    return (
        <main className="w-full flex flex-col">
            <MaxWrapper className="w-full px-4 md:px-6 lg:px-8">
                <ChooseStrategy />
            </MaxWrapper>
        </main>
    )
}

export default Strategy