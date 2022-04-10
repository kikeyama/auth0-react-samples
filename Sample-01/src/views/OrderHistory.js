import React, {useEffect, useState, useRef} from "react";
import { Container, Row, Alert } from "reactstrap";

import Highlight from "../components/Highlight";
import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";

export const OrderHistoryComponent = () => {
  const { user, getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();

  const [accessToken, setAccessToken] = useState(null);
  const [userMetadata, setUserMetadata] = useState(null);
  const [err, setErr] = useState(null);

  const mounted = useRef(false)

  const { audience, domain, tenantDomain } = getConfig();

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  const handleConsent = async () => {
    try {
      const token = await getAccessTokenWithPopup({
        audience: `https://${tenantDomain}/api/v2/`,
        scope: 'read:current_user',
      });
      setAccessToken(token);
      setErr(null);
    } catch (e) {
      console.log(e.message + ' in handleConsent');
      setErr(e.error);
    }
  };

  const getAccessToken = async () => {  
    try {
      const token = await getAccessTokenSilently({  // Failed with `Consent required` --> fixed by enabling `Allow Skipping User Consent`
      //const token = await getAccessTokenWithPopup({
        audience: `https://${tenantDomain}/api/v2/`,
        scope: 'read:current_user',
      });
      setAccessToken(token);
      setErr(null);
    } catch (e) {
      console.log(e.message + ' in getAccessToken');
      setErr(e.error);
    }
  };

  const getUserMetadata = async () => {
    try {
      const userDetailsByIdUrl = `https://${domain}/api/v2/users/${user.sub}`;

      const metadataResponse = await fetch(userDetailsByIdUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      metadataResponse.json().then(data => {
        setUserMetadata(data.user_metadata);
        setErr(null);
      });

    } catch (e) {
      setUserMetadata(null);
      console.log(e.message + ' in getUserMetadata');
      setErr(e.error);
    }
  };

  useEffect(() => {
    if (mounted.current) {
      // componentDidUpdate
      getUserMetadata();
    } else {
      // componentDidMount
      getAccessToken();
      mounted.current = true;
    }
  }, [accessToken]);


  var orders = userMetadata?.orders.map((value, index) => {
    return (
      <Row key={index}>
        <Highlight>{JSON.stringify(value, null, 2)}</Highlight>
      </Row>
    );
  });

  return (
    <Container className="mb-5">
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
        <h1>Order History</h1>
      </Row>
      {orders}
    </Container>
  );
};

export default withAuthenticationRequired(OrderHistoryComponent, {
  onRedirecting: () => <Loading />,
});
