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

function checkJwt(req, res, next) {
  const authHeader = req.headers['authorization'] || req.body.Authorization;

  console.log('[checkJwt] Incoming request to:', req.originalUrl);
  console.log('[checkJwt] Authorization header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('[checkJwt] Missing or invalid Authorization header');
    return res.status(401).send('Missing or invalid Authorization');
  }

  const token = authHeader.split(' ')[1];
  console.log('[checkJwt] Extracted token:', token.substring(0, 20), '...');

  jwt.verify(token, getKey, {
    audience: 'foi-report-download-6037',
    issuer: `${keycloakBaseUrl}/realms/standard`,
    algorithms: ['RS256'],
  }, (err, decoded) => {
    if (err) {
      console.error('[checkJwt] Token verification failed:', err.message);
      return res.status(401).send('Invalid token');
    }
    console.log('[checkJwt] Token verified for user:', decoded.idir_username || decoded.preferred_username);

    req.user = decoded;
    next();
  });
}


module.exports = checkJwt;
