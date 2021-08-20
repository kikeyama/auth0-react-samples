import React, {useEffect, useState} from "react";
import { Container, Row, Alert } from "reactstrap";

import Highlight from "../components/Highlight";
import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";

export const OrderHistoryComponent = () => {
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
