import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080/',
  realm: 'my-kong',
  clientId: 'kong',
});

keycloak.init({ onLoad: 'login-required' }).then(authenticated => {
  if (authenticated) {
    console.log("Authenticated", keycloak.token);
  }
});
export const hasRole = (role) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.roles?.includes(role);
  };
  