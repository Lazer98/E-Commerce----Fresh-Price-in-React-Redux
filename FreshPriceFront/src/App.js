import React from 'react';

import {
  Route,
  Routes,
  Navigate
} from 'react-router-dom';

import Users from './user/pages/Users';
import NewPlace from './places/pages/NewPlace';
import UserPlaces from './places/pages/UserPlaces';
import UpdatePlace from './places/pages/UpdatePlace';
import Auth from './user/pages/Auth';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';
import NewProduct from './products/pages/NewProduct';
import UpdateProduct from './products/pages/UpdateProduct';
import PlaceProducts from './products/pages/PlaceProducts';
import AllPlaces from './places/pages/AllPlaces';
import Email from './shared/components/Email';


const App = () => {
  const { token, login, logout, userId, userRole } = useAuth();

  let routes;

  if (token) {
    routes = (
      <Routes>
        <Route exact path="/" element={<AllPlaces />} />
        <Route exact path="/allUsers/:userId" element={<Users />} />
        <Route exact path="/:userId/places" element={<UserPlaces />} />
        <Route exact path="/places/new" element={<NewPlace />} />
        <Route exact path="/places/:placeId" element={<UpdatePlace />} />
        <Route exact path="/:placeId/products/new" element={<NewProduct />} />
        <Route exact path="/:placeId/products/:productId" element={<UpdateProduct />} />
        <Route path="/:placeId/products" element={<PlaceProducts />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    );
  } else {
    routes = (
      <Routes>
        <Route exact path="/" element={<AllPlaces />} />
        <Route exact path="/email" element={<Email />} />
        <Route exact path="/:userId/places" element={<UserPlaces />} />
        <Route exact path="/:placeId/products" element={<PlaceProducts />} />
        <Route exact path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (

    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        userRole: userRole,
        token: token,
        userId: userId,
        login: login,
        logout: logout
      }}
    >
      <MainNavigation />
      <main>{routes}</main>
    </AuthContext.Provider>
  );
};

export default App;
