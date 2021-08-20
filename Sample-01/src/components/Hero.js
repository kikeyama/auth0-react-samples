import React from "react";
import logo from "../img/delivery_pizza.png";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from 'react-router-dom';

const Hero = () => {
  const {
    isAuthenticated,
    loginWithRedirect,
  } = useAuth0();

  return (
    <div className="text-center hero my-5">
      <img className="mb-3 app-logo" src={logo} alt="Pizza 42 logo" width="360" />
      <h1 className="mb-4">Welcome to Pizza 42!!</h1>

        {!isAuthenticated
          ? (
      <p className="lead">
            Get pizzas now <Link onClick={() => loginWithRedirect()}>Login</Link>
      </p>
          ) : (
      <p className="lead">
            <Link to="/order">Order</Link> pizzas and you&#39;ll get them soon.
      </p>
          )
        }
    </div>
  );
};

export default Hero;
