const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const authConfig = require("./src/auth_config.json");
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

if (
  !authConfig.domain ||
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
app.use(cors({ origin: appOrigin }));

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

app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!",
  });
});

app.post("/api/order", checkJwt, (req, res) => {
  time = new Date().toISOString();
  id = uuidv4();
  res.send({
    msg: "Successfully ordered and you'll get pizza soon!",
    time: time,
    id: id,
    order: {...req.body},
  });
});

// health check for ALB
app.get("/health", (req, res) => {
  res.send("OK");
})

app.listen(port, () => console.log(`API Server listening on port ${port}`));
