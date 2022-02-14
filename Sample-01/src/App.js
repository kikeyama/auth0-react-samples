import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import CustomRoute from "./components/CustomRoute";
import Home from "./views/Home";
import Profile from "./views/Profile";
import ExternalApi from "./views/ExternalApi";
import Order from "./views/Order";
import OrderHistory from "./views/OrderHistory";
import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";

// styles
import "./App.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
initFontAwesome();

const App = () => {
  const { isLoading, error } = useAuth0();

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <BrowserRouter history={history}>
      <div id="app" className="d-flex flex-column h-100">
        <NavBar />
        <Container className="flex-grow-1 mt-5">
          <Switch>
            <CustomRoute path="/" title="Home | Pizza42" exact component={Home} />
            <CustomRoute path="/profile" title="Profile | Pizza42" component={Profile} />
            <CustomRoute path="/history" title="Order History | Pizza42" component={OrderHistory} />
            <CustomRoute path="/external-api" title="API Test | Pizza42" component={ExternalApi} />
            <CustomRoute path="/order" title="Order | Pizza42" component={Order} />
          </Switch>
        </Container>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
