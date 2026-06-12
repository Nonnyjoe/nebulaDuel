import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <section className="w-full min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="reveal-up d1 font-belanosima uppercase tracking-[0.5em] text-myGreen text-xs mb-4">
        Lost in the void
      </p>
      <h1 className="reveal-up d2 font-belanosima text-[26vw] md:text-[10rem] leading-none text-aurora select-none">
        404
      </h1>
      <p className="reveal-up d3 font-poppins text-gray-400 text-sm md:text-base max-w-md mt-4">
        This sector of the Nebula doesn't exist — or was consumed by Nyxar the
        Eternal. Either way, there's nothing to fight here.
      </p>
      <div className="reveal-up d4 mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="btn-glow rounded-xl font-belanosima uppercase tracking-wide text-sm px-8 py-3.5"
        >
          Return home
        </Link>
        <Link
          to="/campaign"
          className="rounded-xl border border-gray-700 text-gray-300 font-belanosima uppercase tracking-wide text-sm px-8 py-3.5 hover:border-myGreen hover:text-myGreen transition-colors"
        >
          Enter the campaign
        </Link>
      </div>
    </section>
  );
};

export default PageNotFound;
