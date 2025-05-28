import Keycloak from 'keycloak-js';

export function createKeycloak() {
  const project = import.meta.env.VITE_PROJECT || 'dev';
  let url;

  switch (project) {
    case 'test':
      url = 'https://test.loginproxy.gov.bc.ca/auth';
      break;
    case 'prod':
      url = 'https://loginproxy.gov.bc.ca/auth';
      break;
    case 'dev':
    default:
      url = 'https://dev.loginproxy.gov.bc.ca/auth';
  }

  console.log('[Keycloak] Using URL:', url);

  return new Keycloak({
    url,
    realm: 'standard',
    clientId: 'foi-report-download-6037',
  });
}
