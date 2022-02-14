import React from "react";
//import React, {useEffect} from "react";
import { Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Waiting from "../views/Waiting";

const CustomRoute = (props) => {
  const {
  	user,
  	isAuthenticated
  } = useAuth0();

  var customProps = {};

  for (let key in props) {
    (isAuthenticated && !user.email_verified && key === 'component') ? customProps[key] = Waiting : customProps[key] = props[key];
  }

  //useEffect(() => {
  //  document.title = props.title;
  //});

  return (
    <Route {...customProps}>
      {props.children}
    </Route>
  );
};

export default CustomRoute;
