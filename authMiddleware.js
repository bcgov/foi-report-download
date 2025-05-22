const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Prefer VITE_PROJECT if set, fallback to dev for local development
const project = process.env.VITE_PROJECT || 'dev';

let keycloakBaseUrl;
if (project === 'test') {
  keycloakBaseUrl = 'https://test.loginproxy.gov.bc.ca/auth';
} else if (project === 'prod') {
  keycloakBaseUrl = 'https://loginproxy.gov.bc.ca/auth';
} else {
  keycloakBaseUrl = 'https://dev.loginproxy.gov.bc.ca/auth';
}

// Setup JWKS client to fetch public keys from Keycloak
const client = jwksClient({
  jwksUri: `${keycloakBaseUrl}/realms/standard/protocol/openid-connect/certs`
});
console.log(`[authMiddleware] Keycloak base URL: ${keycloakBaseUrl}`);

// Helper to get signing key
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// Middleware function
function checkJwt(req, res, next) {
  const authHeader = req.headers.authorization || req.body.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Missing or invalid Authorization');
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, getKey, {
    audience: 'foi-report-download-6037',
    issuer: `${keycloakBaseUrl}/realms/standard`,
    algorithms: ['RS256'],
  }, (err, decoded) => {
    if (err) {
      return res.status(401).send('Invalid token');
    }
    req.user = decoded;
    console.log(`[authMiddleware] Report was downloaded by an Authenticated user: ${decoded.idir_username}`);

    next();
  });
}

module.exports = checkJwt;
