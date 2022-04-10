import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Alert } from "reactstrap";
import { Link } from "react-router-dom";

import Highlight from "../components/Highlight";
import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";

import jwt_decode from "jwt-decode";

export const OrganizationsComponent = () => {
  const {
    user,
    loginWithRedirect,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
  } = useAuth0();

  const [accessToken, setAccessToken] = useState(null);
  const [userOrg, setUserOrg] = useState([]);
  const [err, setErr] = useState(null);

  const mounted = useRef(false)

  const { apiOrigin, audience } = getConfig();

  const scopes = [
    'create:orders',
    'read:orders',
    'update:orders',
    'delete:orders',
    'read:current_user',
    'read:org'
  ];

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  const handleConsent = async () => {
    try {
      console.log('start handleConsent');
      const token = await getAccessTokenWithPopup({
        audience: audinence,
        scope: scopes.join(' '),
      });
      setAccessToken(token);
      setErr(null);
      console.log('finish handleConsent');
    } catch (e) {
      console.log(e.message + ' in handleConsent');
      setErr(e.error);
    }
  };

  const getAccessToken = async () => {  
    try {
      console.log('start getAccessToken');
      //const token = await getAccessTokenWithPopup({
      const token = await getAccessTokenSilently({
        audience: audinence,
        scope: scopes.join(' '),
      });
      setAccessToken(token);
      setErr(null);
      console.log('finish getAccessToken');
    } catch (e) {
      console.log(e.message + ' in getAccessToken');
      setErr(e.error);
    }
  };

  const getUserOrganizations = async () => {
    try {
      const userOrgUrl = `${apiOrigin}/api/management/users/${user.sub}/organizations`;

      const userOrgResponse = await fetch(userOrgUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      userOrgResponse.json().then(data => {
        setUserOrg(data.orgs);
      });

    } catch (e) {
      setUserOrg(null);
      console.log(e.message + ' in getUserOrganizations');
      setErr(e.error);
    }
  };

  useEffect(() => {
    if (mounted.current) {
      // componentDidUpdate
      getUserOrganizations();
    } else {
      // componentDidMount
      getAccessToken();
      mounted.current = true;
    }
  }, [accessToken]);

  const decodedToken = accessToken ? jwt_decode(accessToken) : null;

  const userOrgDom = userOrg.map((value, index) => {
    return (
      <Row key={index}>
        <Link to={`/organizations/${value.id}`}>
          {value.display_name}
        </Link>
      </Row>
    );
  });

  return(
    <React.Fragment>
      <h1>Organizations</h1>
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
                consent to get access token
              </a>
            </Alert>
          )}
        </div>
        <Row>
          <h2>Current Access Token (without Organization)</h2>
        </Row>
        <Row>
          <Highlight>{JSON.stringify(decodedToken, null, 2)}</Highlight>
        </Row>
        <Row>
          <h2>{user.nickname}'s Organizations</h2>
        </Row>
        {userOrgDom}
      </Container>
    </React.Fragment>
  );
}

export default withAuthenticationRequired(OrganizationsComponent, {
  onRedirecting: () => <Loading />,
});
