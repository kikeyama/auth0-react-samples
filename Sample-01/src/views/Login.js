import React from "react";
import { useLocation } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "reactstrap";

const Login = (props) => {
  const params = new URLSearchParams(useLocation().search);
  const organization = params.get('organization');
  const organizationName = params.get('organization_name');
  const invitation = params.get('invitation');

  const { loginWithRedirect } = useAuth0();

  return (
    <React.Fragment>
      <Button
        onClick={() => loginWithRedirect({
          organization: `${organization}`,
          invitation: `${invitation}`,
        })}
      >
        Welcome to {organizationName}
      </Button>
    </React.Fragment>
  );
  if (organization && invitation) {

  }
}

export default Login;