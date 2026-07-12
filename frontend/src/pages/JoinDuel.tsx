import JoinDuelComp from "../components/duels/JoinDuel";
import MaxWrapper from "../components/shared/MaxWrapper";

const JoinDuel = () => {
  return (
    <main className="w-full flex flex-col">
      <MaxWrapper className="w-full px-4 md:px-6 lg:px-8">
        <JoinDuelComp />
      </MaxWrapper>
    </main>
  );
};

export default JoinDuel;