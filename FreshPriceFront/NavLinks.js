import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import { AuthContext } from '../../context/auth-context';
import './NavLinks.css';

const NavLinks = props => {
  const auth = useContext(AuthContext);


  return (
    <ul className="nav-links">
       {auth.isLoggedIn && auth.userRole === "admin" && (
        <button >
          <NavLink to={`/allUsers/${auth.userId}`}>All users</NavLink>
        </button>
      )}
      {auth.isLoggedIn && auth.userRole !=="admin" (
        <button >
          <NavLink to={`/${auth.userId}/places`}>My stores</NavLink>
        </button>
      )}
      {auth.isLoggedIn && (
        <button >
          <NavLink to="/places/new">Add place</NavLink>
        </button>
      )}
      {!auth.isLoggedIn && (
        <button >
          <NavLink to="/auth">Sign in</NavLink>
        </button>

      )}
      {!auth.isLoggedIn && (
        <button >
          <NavLink to="/email">Get in touch with us!</NavLink>
        </button>

      )}
      
      {auth.isLoggedIn && (
        <button onClick={auth.logout}>
          <NavLink to="/">Log out</NavLink>
        </button>
      )}
      {/* {auth.isLoggedIn && (
        <Avatar image={`http://localhost:5000/${props.image}`} alt={props.name} />
      )} */}
    </ul>
  );
};

export default NavLinks;
  