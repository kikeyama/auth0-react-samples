import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Alert } from "reactstrap";
import { Link } from "react-router-dom";

import Highlight from "../components/Highlight";
import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";

import jwt_decode from "jwt-decode";

export const OrgInfoComponent = (props) => {
  const {
    user,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
  } = useAuth0();

  const [accessToken, setAccessToken] = useState(null);
  const [org, setOrg] = useState(null);
  const [orgRoles, setOrgRoles] = useState(null);
  const [err, setErr] = useState(null);

  const mounted = useRef(false)

  const { apiOrigin, audience } = getConfig();

  const orgId = props.match.params.orgId;

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
      const token = await getAccessTokenWithPopup({
        audience: audinence,
        scope: scopes.join(' '),
        organization: orgId,
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
      //const token = await getAccessTokenWithPopup({
      const token = await getAccessTokenSilently({
        audience: audinence,
        scope: scopes.join(' '),
        organization: orgId,
      });
      setAccessToken(token);
      setErr(null);
    } catch (e) {
      console.log(e.message + ' in getAccessToken');
      setErr(e.error);
    }
  };

  const getOrg = async () => {
    try{
      const orgUrl = `${apiOrigin}/api/management/organizations/${orgId}`;
      const orgRoleUrl = `${apiOrigin}/api/management/organizations/${orgId}/members/${user.sub}/roles`;

      const orgResponse = await fetch(orgUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      orgResponse.json().then(data => {
        setOrg(data.org);
      });

      const orgRolesResponse = await fetch(orgRoleUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      //const orgRolesResult = await orgRolesResponse.org.json();
      orgRolesResponse.json().then(data => {
        setOrgRoles(data.roles);
      });

      setErr(null);
    } catch (e) {
      console.log(e.message + ' in getOrg');
      setErr(e.error);
    }
  }

  useEffect(() => {
    if (mounted.current) {
      // componentDidUpdate
      getOrg();
    } else {
      // componentDidMount
      getAccessToken();
      mounted.current = true;
    }
  }, [accessToken]);

  const decodedToken = accessToken ? jwt_decode(accessToken) : null;

  return(
    <React.Fragment>
      <h1>Organization Detail - {orgId}</h1>
      <Container className="mb-5">
        <div>
          {err === "consent_required" && (
            <Alert color="warning">
              You need to{" "}
              <a
                href="#"
                className="alert-link"
                onClick={(e) => handle(e, handleConsent)}
              >
                consent to get access token
              </a>
            </Alert>
          )}
        </div>
        <Row>
          <h2>Current Access Token (with Organization)</h2>
        </Row>
        <Row>
          <Highlight>{JSON.stringify(decodedToken, null, 2)}</Highlight>
        </Row>
        <Row>
          <h2>Organization Summary</h2>
        </Row>
        <Row>
          <Highlight>{JSON.stringify(org, null, 2)}</Highlight>
        </Row>
        <Row>
          <h2>{user.nickname}'s Role in Organization</h2>
        </Row>
        <Row>
          <Highlight>{JSON.stringify(orgRoles, null, 2)}</Highlight>
        </Row>
      </Container>
    </React.Fragment>
  );
}

export default withAuthenticationRequired(OrgInfoComponent, {
  onRedirecting: () => <Loading />,
});
