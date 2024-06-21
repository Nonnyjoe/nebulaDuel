import React from "react";

import ProfileForm from "./Components/profileForm/Profileform";
import "./Components/characters/characters.css";
import Cards from "./Components/characters/Cards";

const selectCharacters = () => {
  return (
    <div>
      <ProfileForm />
      <Cards />
      {/* <RouterProvider router={router} /> */}
    </div>
  );
};

export default selectCharacters;
