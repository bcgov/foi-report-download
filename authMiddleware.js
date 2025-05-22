const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Setup JWKS client to fetch public keys from Keycloak
const client = jwksClient({
  jwksUri: 'https://dev.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/certs'
});

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
    issuer: 'https://dev.loginproxy.gov.bc.ca/auth/realms/standard',
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
