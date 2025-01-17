const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const jwt = require("express-jwt");
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require("jwks-rsa");
const authConfig = require("./src/auth_config.json");
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();

require('dotenv').config({ path: `${__dirname}/.env` });

var port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = process.env.APP_ORIGIN || authConfig.appOrigin || `http://localhost:${appPort}`;

if (process.env.NODE_ENV === 'prod') {
  port = process.env.API_PORT || 8080;
}

const ManagementClient = require('auth0').ManagementClient;

const auth0 = new ManagementClient({
  domain: authConfig.tenantDomain,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  scope: 'read:users update:users read:organizations read:organizations_summary read:organization_member_roles'
});

if (
  !authConfig.tenantDomain ||
  !authConfig.audience ||
  authConfig.audience === "YOUR_API_IDENTIFIER"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

app.use(morgan("dev"));
app.use(helmet());

const subdomainRegex = new RegExp(appOrigin.replace(/https?:\/\//, '').replace(/\./g, '\\.'));
app.use(cors({ origin: [appOrigin, subdomainRegex] }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

const checkScopesCreateOrders = jwtAuthz([ 'create:orders' ]);
const checkScopesUpdateVerification = jwtAuthz([ 'update:verification_email' ]);
const checkScopesUpdateUser = jwtAuthz([ 'update:user_verified' ]);
const checkScopesReadOrg = jwtAuthz([ 'read:org' ]);

app.get("/healthz", (req, res) => {
  res.set('Content-Type', 'application/json');
  res.send({status:"ok"});
});

app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!",
  });
});

// receive orders
app.post("/api/order", checkJwt, checkScopesCreateOrders, (req, res) => {
  var time = new Date().toISOString();
  var id = uuidv4();
  var result = {
    msg: "Successfully ordered and you'll get pizza soon!",
    time: time,
    id: id,
    order: {...req.body},
  }
  res.send(result);
  // update auth0 profile
  auth0.getUser({ id: req.body.user_id }, (err, user) => {
    if (err) {
      console.log(err.message);
      return;
    }
    //if (user?.user_metadata === undefined) {
    //  user.user_metadata = {};
    //}
    user.user_metadata = user?.user_metadata || {};
    //if (user?.user_metadata?.orders === undefined) {
    //  user.user_metadata.orders = [];
    //}
    user.user_metadata.orders = user?.user_metadata?.orders || [];
    user.user_metadata.orders.push(result);
    //metadata = user.user_metadata;
    auth0.updateUserMetadata({ id: req.body.user_id }, user.user_metadata, (err, user) => {
      if (err) {
        console.log(err.message);
        return
      }
      //console.log(user);
    });
  });
  //metadata.orders.push(result);
});

// send verification email
app.post("/api/management/jobs/verification-email", checkJwt, checkScopesUpdateVerification, (req, res) => {
  try {
    auth0.sendEmailVerification(req.body, (err) => {
      if (err) {
        console.log(err.message);
        return res.status(err.statusCode).json({
          status: 'error',
          message: err.message
        });
      } else {
        return res.send({status: 'success'});
      }
    });
  } catch (e) {
    return res.status(e.statusCode).json({
      status: 'error',
      message: e.message
    });
  }
});

// Update user
app.post("/api/management/users/:id", checkJwt, checkScopesUpdateUser, (req, res) => {
  try {
    console.log(`id: ${req.params.id}`);
    auth0.updateUser({id: req.params.id}, req.body, (err, user) => {
      if (err) {
        console.log(err.message);
        return res.status(err.statusCode).json({
          status: 'error',
          message: err.message
        });
      } else {
        return res.send({
          status: 'success',
          user: user
        });
      }
    });
  } catch (e) {
    return res.status(e.statusCode).json({
      status: 'error',
      message: e.message
    });
  }
});

// List User's Organizations
app.get("/api/management/users/:id/organizations", checkJwt, checkScopesReadOrg, (req, res) => {
  try {
    console.log(`id: ${req.params.id}`);
    auth0.users.getUserOrganizations({id: req.params.id}, (err, orgs) => {
      if (err) {
        console.log(err.message);
        return res.status(err.statusCode).json({
          status: 'error',
          message: err.message
        });
      } else {
        return res.send({
          status: 'success',
          orgs: orgs
        });
      }
    });
  } catch (e) {
    return res.status(e.statusCode).json({
      status: 'error',
      message: e.message
    });
  }
});

// Get Organization by Org ID
app.get("/api/management/organizations/:id", checkJwt, checkScopesReadOrg, (req, res) => {
  try {
    console.log(`id: ${req.params.id}`);
    auth0.organizations.getByID({id: req.params.id}, (err, org) => {
      if (err) {
        console.log(err.message);
        return res.status(err.statusCode).json({
          status: 'error',
          message: err.message
        });
      } else {
        return res.send({
          status: 'success',
          org: org
        });
      }
    });
  } catch (e) {
    return res.status(e.statusCode).json({
      status: 'error',
      message: e.message
    });
  }
});

// Get Roles from a member in a Organization
app.get("/api/management/organizations/:id/members/:userId/roles", checkJwt, checkScopesReadOrg, (req, res) => {
  try {
    console.log(`id: ${req.params.id} / user_id: ${req.params.userId}`);
    auth0.organizations.getMemberRoles({id: req.params.id, user_id: req.params.userId}, (err, roles) => {
      if (err) {
        console.log(err.message);
        return res.status(err.statusCode).json({
          status: 'error',
          message: err.message
        });
      } else {
        return res.send({
          status: 'success',
          roles: roles
        });
      }
    });
  } catch (e) {
    return res.status(e.statusCode).json({
      status: 'error',
      message: e.message
    });
  }
});

// health check for ALB
app.get("/health", (req, res) => {
  res.send("OK");
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));
