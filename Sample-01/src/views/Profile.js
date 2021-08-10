import React, {useEffect, useState} from "react";
import { Container, Row, Col, Alert } from "reactstrap";

import Highlight from "../components/Highlight";
import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";

export const ProfileComponent = () => {
  const { user, getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
  const [userMetadata, setUserMetadata] = useState(null);
  const [err, setErr] = useState(null);

  const { audience, domain } = getConfig();

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup();
      setErr(null);
    } catch (e) {
      console.log(e.message + ' in handleConsent');
      setErr(e.error);
    }

    await getUserMetadata();
  };

  const getUserMetadata = async () => {  
    try {
      const accessToken = await getAccessTokenSilently({  // Failed with `Consent required` --> fixed by enabling `Allow Skipping User Consent`
      //const accessToken = await getAccessTokenWithPopup({
        audience: `https://${domain}/api/v2/`,
        scope: "read:current_user"
        //audience: audience,
        //scope: "read:current_user",
      });

      const userDetailsByIdUrl = `https://${domain}/api/v2/users/${user.sub}`;

      const metadataResponse = await fetch(userDetailsByIdUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { user_metadata } = await metadataResponse.json();
      console.log(user_metadata);

      setUserMetadata(user_metadata);
      setErr(null);
    } catch (e) {
      console.log(e.message + ' in getUserMetadata');
      setErr(e.error);
    }
  };

  useEffect(() => {  
    getUserMetadata();
  }, [getAccessTokenSilently, user?.sub]);

  var orders = userMetadata?.orders.map((value, index) => {
    return (
      <Row>
        <Highlight>{JSON.stringify(value, null, 2)}</Highlight>
      </Row>
    );
  });

  return (
    <Container className="mb-5">
      <Row className="align-items-center profile-header mb-5 text-center text-md-left">
        <Col md={2}>
          <img
            src={user.picture}
            alt="Profile"
            className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
          />
        </Col>
        <Col md>
          <h2>{user.name}</h2>
          <p className="lead text-muted">{user.email}</p>
        </Col>
      </Row>
      <Row>
        <Highlight>{JSON.stringify(user, null, 2)}</Highlight>
      </Row>
      <div>
        {err === "consent_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              className="alert-link"
              onClick={(e) => handle(e, handleConsent)}
            >
              consent to get access to users api
            </a>
          </Alert>
        )}
      </div>
      <Row>
        Order History
      </Row>
      {orders}
    </Container>
  );
};

export default withAuthenticationRequired(ProfileComponent, {
  onRedirecting: () => <Loading />,
});
