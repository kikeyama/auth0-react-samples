import React, { useState } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory } from "@fortawesome/free-solid-svg-icons";
import { getConfig } from "../config";

import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import { useAuth0 } from "@auth0/auth0-react";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
/*
  const [org, setOrg] = useState({});
  const [err, setErr] = useState(null);
*/

  const {
    user,
    isAuthenticated,
    loginWithRedirect,
    logout,
  } = useAuth0();
  const toggle = () => setIsOpen(!isOpen);

  const logoutWithRedirect = () =>
    logout({
      returnTo: window.location.origin,
    });

  const { appOrigin } = getConfig();

/*
  const { appOrigin } = getConfig();
  const currentOrigin = window.location.origin;
  let authOptions = {};

  try {
    const currentOriginArray = currentOrigin.match(/(https?:\/\/)([^\.]+)\.([^$]+)$/);
    const subdomain = currentOriginArray[2];

    if (appOrigin !== currentOrigin && appOrigin === currentOriginArray[1] + currentOriginArray[3]) {
      console
    }
  } catch (e) {
    if (e instanceof TypeError) {
      console.log(e);
      setErr(e.error);
    }
  }

  const getOrganizationByName = async (orgName) => {
    try {
      const orgUrl = `${apiOrigin}/api/management/organizations/name/${orgName}`;

      const orgResponse = await fetch(orgUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      orgResponse.json().then(data => {
        return data.id;
      });

    } catch (e) {
      setUserOrg(null);
      console.log(e.message + ' in getUserOrganizations');
      setErr(e.error);
    }
  };
*/

  return (
    <div className="nav-container">
      <Navbar color="light" light expand="md">
        <Container>
          <NavbarBrand className="logo" />
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar>
            <Nav className="mr-auto" navbar>
              <NavItem>
                <NavLink
                  tag={RouterNavLink}
                  to="/"
                  exact
                  activeClassName="router-link-exact-active"
                >
                  Home
                </NavLink>
              </NavItem>
              {(isAuthenticated && user.email_verified) && (
                <NavItem>
                  <NavLink
                    tag={RouterNavLink}
                    to="/external-api"
                    exact
                    activeClassName="router-link-exact-active"
                  >
                    External API
                  </NavLink>
                </NavItem>
              )}
              {(isAuthenticated && user.email_verified) && (
                <NavItem>
                  <NavLink
                    tag={RouterNavLink}
                    to="/order"
                    exact
                    activeClassName="router-link-exact-active"
                  >
                    Order Pizza
                  </NavLink>
                </NavItem>
              )}
              {(isAuthenticated && user.email_verified) && (
                <NavItem>
                  <NavLink
                    tag={RouterNavLink}
                    to="/organizations"
                    exact
                    activeClassName="router-link-exact-active"
                  >
                    Organizations
                  </NavLink>
                </NavItem>
              )}
            </Nav>
            <Nav className="d-none d-md-block" navbar>
              {!isAuthenticated && (
                <NavItem>
                  <Button
                    id="qsLoginBtn"
                    color="primary"
                    className="btn-margin"
                    onClick={() => loginWithRedirect({
                      //connection: 'tmp-2nd-database',
                    })}
                  >
                    Log in
                  </Button>
                </NavItem>
              )}
              {isAuthenticated && (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret id="profileDropDown">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="nav-user-profile rounded-circle"
                      width="50"
                    />
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem header>{user.name}</DropdownItem>
                    {/* Force re-auhenticate with username and password
                    <DropdownItem
                      onClick={() => loginWithRedirect({
                        prompt: 'login',
                        redirectUri: `${appOrigin}/profile`,
                        //connection: 'Username-Password-Authentication',
                      })}
                      className="dropdown-profile"
                      activeClassName="router-link-exact-active"
                    >
                    */}
                    <DropdownItem
                      tag={RouterNavLink}
                      to="/profile"
                      className="dropdown-profile"
                      activeClassName="router-link-exact-active"
                    >
                      <FontAwesomeIcon icon="user" className="mr-3" /> Profile
                    </DropdownItem>
                    <DropdownItem
                      tag={RouterNavLink}
                      to="/history"
                      className="dropdown-profile"
                      activeClassName="router-link-exact-active"
                    >
                      <FontAwesomeIcon icon={faHistory} className="mr-3" /> History
                    </DropdownItem>
                    <DropdownItem
                      id="qsLogoutBtn"
                      onClick={() => logoutWithRedirect()}
                    >
                      <FontAwesomeIcon icon="power-off" className="mr-3" /> Log
                      out
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              )}
            </Nav>
            {!isAuthenticated && (
              <Nav className="d-md-none" navbar>
                <NavItem>
                  <Button
                    id="qsLoginBtn"
                    color="primary"
                    block
                    onClick={() => loginWithRedirect({
                      //connection: 'tmp-2nd-database',
                    })}
                  >
                    Log in
                  </Button>
                </NavItem>
              </Nav>
            )}
            {isAuthenticated && (
              <Nav
                className="d-md-none justify-content-between"
                navbar
                style={{ minHeight: 170 }}
              >
                <NavItem>
                  <span className="user-info">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="nav-user-profile d-inline-block rounded-circle mr-3"
                      width="50"
                    />
                    <h6 className="d-inline-block">{user.name}</h6>
                  </span>
                </NavItem>
                <NavItem>
                  <FontAwesomeIcon icon="user" className="mr-3" />
                  <RouterNavLink
                    to="/profile"
                    activeClassName="router-link-exact-active"
                  >
                    Profile
                  </RouterNavLink>
                </NavItem>
                <NavItem>
                  <FontAwesomeIcon icon={faHistory} className="mr-3" />
                  <RouterNavLink
                    to="/history"
                    activeClassName="router-link-exact-active"
                  >
                    History
                  </RouterNavLink>
                </NavItem>
                <NavItem>
                  <FontAwesomeIcon icon="power-off" className="mr-3" />
                  <RouterNavLink
                    to="#"
                    id="qsLogoutBtn"
                    onClick={() => logoutWithRedirect()}
                  >
                    Log out
                  </RouterNavLink>
                </NavItem>
              </Nav>
            )}
          </Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavBar;
