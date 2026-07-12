import CreateAiDuel from "../components/duels/CreateAiDuel"
import MaxWrapper from "../components/shared/MaxWrapper"


const AIduel = () => {
    return (
        <main className="w-full flex flex-col">
            <MaxWrapper className="w-full px-4 md:px-6 lg:px-8">
                <CreateAiDuel />
            </MaxWrapper>
        </main>
    )
}

export default AIduel