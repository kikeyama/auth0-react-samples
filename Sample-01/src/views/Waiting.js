import React, {useEffect, useState} from "react";
import { Link } from 'react-router-dom';
import { Button } from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import Highlight from "../components/Highlight";
import Loading from "../components/Loading";
import { getConfig } from "../config";

const WaitingComponent = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
    logout
  } = useAuth0();
  const [state, setState] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
  });

  const { audience, domain, clientId, apiOrigin } = getConfig();

//  const handleConsent = async () => {
//    try {
//      await getAccessTokenWithPopup({
//        audience: audience,
//        scope: "update:verification_email"
//      });
//      setState({
//        ...state,
//        error: null,
//      });
//    } catch (e) {
//      console.log(e.message);
//      setState({
//        ...state,
//        error: e.error,
//      });
//    }
//
//    await postVerificationEmail();
//  };

  const postVerificationEmail = async () => {  
    try {
      const accessToken = await getAccessTokenSilently({
        audience: audience,
        scope: "update:verification_email"
      });

      const payload = {
        user_id: user.sub,
      }

      const postVerificationEmailUrl = `${apiOrigin}/api/management/jobs/verification-email`;

      const response = await fetch(postVerificationEmailUrl, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      setState({
        showResult: true,
        apiMessage: responseData,
        error: null
      });
    } catch (e) {
      console.log(e);
      setState({
        ...state,
        error: e.error
      });
    }
  };

  const postUserVerified = async () => {  
    try {
      const accessToken = await getAccessTokenSilently({
        audience: audience,
        scope: "update:user_verified"
      });

      const payload = {
        email_verified: true,
      }

      const postUserVerifiedlUrl = `${apiOrigin}/api/management/users/${user.sub}`;

      const response = await fetch(postUserVerifiedlUrl, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      setState({
        showResult: true,
        apiMessage: responseData,
        error: null
      });
    } catch (e) {
      console.log(e);
      setState({
        ...state,
        error: e.error
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  const logoutWithRedirect = () =>
    logout({
      returnTo: window.location.origin,
    });

  return (
    //isAuthenticated && (
      <div>
        <h1>Waiting for email varification</h1>
        <div>
          Go to <Link to="/">Home</Link>
          {" | "}
          <Link onClick={logoutWithRedirect}>Logout</Link>
        </div>
        <div>
          <Button
            color="primary"
            className="mt-5"
            onClick={postVerificationEmail}
          >
            Resend verification email
          </Button>
          <Button
            color="primary"
            className="mt-5"
            onClick={postUserVerified}
          >
            Force verified (not recommended)
          </Button>
        </div>
        <div>
          {state.showResult && (
            <Highlight>
              <span>{JSON.stringify(state.apiMessage, null, 2)}</span>
            </Highlight>
          )}
        </div>
      </div>
    //)
  );
};

export default WaitingComponent;
