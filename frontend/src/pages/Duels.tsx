import ListDuels from "../components/duels/ListDuels";
import GhostMatch from "../components/duels/GhostMatch";
import MaxWrapper from "../components/shared/MaxWrapper";

const Duels = () => {
  return (
    <main className="w-full flex flex-col">
      <MaxWrapper className="w-full px-4 md:px-6 lg:px-8 pt-6">
        <GhostMatch />
        <ListDuels />
      </MaxWrapper>
    </main>
  );
};

export default Duels;
