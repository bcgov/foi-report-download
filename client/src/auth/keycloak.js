import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://dev.loginproxy.gov.bc.ca/auth',
  realm: 'standard',
  clientId: 'foi-report-download-6037',
});

export default keycloak;
