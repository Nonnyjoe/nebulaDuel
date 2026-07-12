import { useActiveAccount } from "thirdweb/react"
import UserProfile from "../components/profile/UserProfile"
import Achievements from "../components/profile/Achievements"
import MaxWrapper from "../components/shared/MaxWrapper"


const Profile = () => {
    const account = useActiveAccount();
    return (
        <main className="w-full flex flex-col">
            <MaxWrapper className="w-full px-4 md:px-6 lg:px-8">
                <UserProfile />
                <div className="mt-10 mb-16">
                    <Achievements wallet={account?.address} />
                </div>
            </MaxWrapper>
        </main>
    )
}

export default Profile