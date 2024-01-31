import React from 'react'

import ProfileForm from '../src/Components/profileForm/Profileform'
import '../src/Components/characters/characters.css';
import Cards from "../src/Components/characters/Cards"
import Header from './Components/header/Header';
import PurchaseCharacter from './Components/purchaseCharacter/purchaseCharacter';

const Profile = () => {
  return (
    <div>
        <Header />
        <ProfileForm />
        <PurchaseCharacter />
        <Cards />
        {/* <RouterProvider router={router} /> */}
    </div>
  )
}

export default Profile