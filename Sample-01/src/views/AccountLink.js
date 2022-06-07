import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Button,
  Table,
} from "reactstrap";

import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";

export const AccountLinkComponent = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [err, setErr] = useState(null);
  const [identities, setIdentites] = useState([]);
  const [mainIdentity, setMainIdentity] = useState(null);

  const mounted = useRef(false)

  const {
    user,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
    loginWithPopup,
    getIdTokenClaims,
  } = useAuth0();

  const { domain, tenantDomain } = getConfig();

  const getAccessToken = async () => {  
    try {
      const token = await getAccessTokenSilently();
      setAccessToken(token);
      setErr(null);
    } catch (e) {
      if (e.error === 'consent_required') {
        const token = await getAccessTokenWithPopup();
        setAccessToken(token);
        setErr(null);
      } else {
        setErr(e.error);
      }
    }
  };


  // https://auth0.com/docs/manage-users/user-accounts/user-account-linking/user-initiated-account-linking-client-side-implementation
  // https://github.com/auth0-samples/auth0-link-accounts-sample/blob/master/SPA/public/js/app.js
  const linkAccount = async (connection) => {
    try{
      await loginWithPopup({
        connection: connection,
      });

      const {
        __raw: targetUserIdToken,
        email_verified,
        email,
      } = await getIdTokenClaims();

      //if (!email_verified) {
      //  throw new Error(
      //    `Account linking is only allowed to a verified account. Please verify your email ${email}.`
      //  );
      //}

      await fetch(`https://${domain}/api/v2/users/${mainIdentity}/identities`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          link_with: targetUserIdToken,
        }),
      });

      getUserProfile();
    } catch (e) {
      setErr(e.error);
    }
  };

  const getUserProfile = async () => {
    try {
      const response = await fetch(
        `https://${domain}/api/v2/users/${mainIdentity}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      response.json().then(profile => {
        setIdentites(profile.identities);
      });
    } catch (e) {
      setErr(e.error);
    }
  }

  const unlinkAccount = async (provider, userId) => {
    //
    try {
      const response = await fetch(
        `https://${domain}/api/v2/users/${mainIdentity}/identities/${provider}/${userId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      getUserProfile();
    } catch (e) {
      setErr(e.error);
    }
  }

  useEffect(() => {
    if (mounted.current) {
      // componentDidUpdate
      getUserProfile();
    } else {
      // componentDidMount
      getAccessToken();
      mounted.current = true;
      setMainIdentity(user.sub);
    }
  }, [accessToken]);

//  useEffect(() => {
//    // Placeholder: create table here
//    if (identities.length === 1) {
//      console.log('user profile has only 1 identity');
//      return;
//    }
//    identitiesMap = identities.map((value, index) => {
//      if (value.provider !== user.sub.split('|')[0] || value.user_id !== user.sub.split('|')[1]) {
//        console.log('return identities table body');
//        return (
//          <tr>
//            <td>{value.connection}</td>
//            <td>{value.isSocial}</td>
//            <td>{value.provider}</td>
//            <td>{value.user_id}</td>
//            <td></td>
//          </tr>
//        );
//      }
//    });
//  }, [identities]);

  const identitiesMap = () => {
    return (
      <React.Fragment>
      {identities.map((identity, index) => {
        if (identity.provider !== mainIdentity.split('|')[0] || identity.user_id !== mainIdentity.split('|')[1]) {
          return(
            <tr key={index}>
              <td>{identity.connection}</td>
              <td>{identity.isSocial.toString()}</td>
              <td>{identity.provider}</td>
              <td>{identity.user_id}</td>
              <td>
                <Button
                  id={identity.provider+"UnlinkBtn"}
                  color="danger"
                  className="btn-margin rounded"
                  onClick={() => unlinkAccount(identity.provider, identity.user_id)}
                >
                  Unconnect
                </Button>
              </td>
            </tr>
          );
        }
      })}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <div>
        <h2 className="mt-3 mb-3">Link Your Social Accounts</h2>
        <Row className="mb-2 pl-3">
          <Button
            id="googleLinkBtn"
            color="primary"
            className="btn-margin w-25 text-center rounded"
            outline={true}
            onClick={() => linkAccount('google-oauth2')}
          >
            Connect with Google
          </Button>
        </Row>
        <Row className="mb-2 pl-3">
          <Button
            id="githubLinkBtn"
            color="primary"
            className="btn-margin w-25 text-center rounded"
            outline={true}
            onClick={() => linkAccount('github')}
          >
            Connect with Github
          </Button>
        </Row>
        <Row className="mb-2 pl-3">
          <Button
            id="lineLinkBtn"
            color="primary"
            className="btn-margin w-25 text-center rounded"
            outline={true}
            onClick={() => linkAccount('line')}
          >
            Connect with LINE
          </Button>
        </Row>
      </div>
      <div className="mt-3 mb-3">
        <Table hover={true}>
          <thead>
            <tr>
              <th>connection</th>
              <th>isSocial</th>
              <th>provider</th>
              <th>user_id</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
          {identitiesMap()}
          </tbody>
        </Table>
      </div>
    </React.Fragment>
  );
};

export default withAuthenticationRequired(AccountLinkComponent, {
  onRedirecting: () => <Loading />,
});
