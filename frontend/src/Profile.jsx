import React from 'react'

import ProfileForm from '../src/Components/profileForm/Profileform'
import '../src/Components/characters/characters.css';
import Cards from "../src/Components/characters/Cards"
import Header from './Components/header/Header';

const Profile = () => {
  return (
    <div>
        <Header />
        <ProfileForm />
        <Cards />
        {/* <RouterProvider router={router} /> */}
    </div>
  )
}

export default Profile