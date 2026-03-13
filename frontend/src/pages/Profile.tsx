import UserProfile from "../components/profile/UserProfile"
import MaxWrapper from "../components/shared/MaxWrapper"


const Profile = () => {
    return (
        <main className="w-full flex flex-col">
            <MaxWrapper className="w-full px-4 md:px-6 lg:px-8">
                <UserProfile />
            </MaxWrapper>
        </main>
    )
}

export default Profile