import React from 'react'
import '../src/Components/characters/characters.css';
import Header from './Components/header/Header';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate()
  const location = useLocation();

  // button data
  const buttonCaptions = [
    {
      name: 'Profile',
      url: '/profile',
    },
    {
      name: 'Purchase Character',
      url: '/purchasecharacter',
    },
    {
      name: 'Your Characters',
      url: '/yourcharacters'
    }
  ];

  return (
    // change this component to a layout
    <div className='gen-wrapper'>
      <Header />
      <section className='profilepage-container' >
        <div className='profilepage-nav'>
          {
            buttonCaptions.map((btn, index) => (
              <button className={`${location.pathname === btn.url ? 'active' : ''}`} key={index} onClick={() => navigate(btn.url)}>{btn.name}</button>
            ))
          }
        </div>
        <section className='profile-wrapper'>
          <Outlet />
        </section>
      </section>

      {/* <RouterProvider router={router} /> */}
    </div>
  )
}

export default Profile