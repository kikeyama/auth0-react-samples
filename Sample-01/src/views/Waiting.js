import React, {useState} from "react";
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import Highlight from "../components/Highlight";
import Loading from "../components/Loading";
import { getConfig } from "../config";

const WaitingComponent = () => {
  const {
    user,
    //isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    //getAccessTokenWithPopup,
    logout
  } = useAuth0();
  const [state, setState] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
  });

  const {
    audience,
    //domain,
    //clientId,
    apiOrigin
  } = getConfig();

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
        <h1>Waiting for email verification</h1>
        <div>
          Go to <Link to="/">Home</Link>
          {" | "}
          <Link onClick={logoutWithRedirect}>Logout</Link>
        </div>
        <Container className="mt-5">
          <Row className="justify-content-md-center">
            <Col md className="mt-3 mb-3">You haven't got verification email?</Col>
            <Col md className="mt-3 mb-3">
              <Button
                color="primary"
                onClick={postVerificationEmail}
              >
                Resend verification email
              </Button>
            </Col>
          </Row>
          <Row>
            <Col md className="mt-3 mb-3">Do you want to make it verified? (only for test purpose)</Col>
            <Col md className="mt-3 mb-3">
              <Button
                color="primary"
                onClick={postUserVerified}
              >
                Force verified (not recommended)
            </Button>
            </Col>
          </Row>
        </Container>
        <div>
          {state.showResult && (
            <div>
              <h2>Result</h2>
              <Highlight>
                <span>{JSON.stringify(state.apiMessage, null, 2)}</span>
              </Highlight>
            </div>
          )}
        </div>
      </div>
    //)
  );
};

export default WaitingComponent;
