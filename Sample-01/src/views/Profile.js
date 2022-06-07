import React, { useEffect } from "react";
import {
  Container,
  Row,
  Col,
} from "reactstrap";

import Highlight from "../components/Highlight";
import Loading from "../components/Loading";
import AccountLink from "./AccountLink";
import { useAuth0, withAuthenticationRequired, Auth0Provider } from "@auth0/auth0-react";
import { getConfig } from "../config";

export const ProfileComponent = () => {
  const {
    user,
//    getAccessTokenSilently,
//    getAccessTokenWithPopup,
//    loginWithRedirect,
//    loginWithPopup,
//    getIdTokenClaims,
  } = useAuth0();

  const { domain, tenantDomain, clientId, audience } = getConfig();

//  const linkAccount = async () => {
//    let accessToken = null;
//    try {
//      accessToken = await getAccessTokenSilently({
//        ignoreCache: true,
//        audience: audience,
//        scope: 'update:current_user_identities',
//      });
//    } catch (e) {
//      if (e.error === 'consent_required') {
//        accessToken = await getAccessTokenWithPopup({
//          ignoreCache: true,
//          audience: audience,
//          scope: 'update:current_user_identities',
//        });
//      }
//    }
//
//    finally {
//      await loginWithPopup({
//        connection: 'google-oauth2',
//      });
//
//      const {
//        __raw: targetUserIdToken,
//        email_verified,
//        email,
//      } = await getIdTokenClaims();
//
//      if (!email_verified) {
//        throw new Error(
//          `Account linking is only allowed to a verified account. Please verify your email ${email}.`
//        );
//      }
//
//      await fetch(`https://${tenantDomain}/api/v2/users/${user.sub}/identities`, {
//        method: "POST",
//        headers: {
//          "Content-Type": "application/json",
//          Authorization: `Bearer ${accessToken}`,
//        },
//        body: JSON.stringify({
//          link_with: targetUserIdToken,
//        }),
//      });
//    }
//  };

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
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        audience={`https://${tenantDomain}/api/v2/`}
        scope='read:current_user update:current_user_identities'
      >
        <AccountLink />
      </Auth0Provider>
    </Container>
  );
};

export default withAuthenticationRequired(ProfileComponent, {
  onRedirecting: () => <Loading />,
});
