import { ApolloClient, InMemoryCache } from '@apollo/client';
import { Buffer } from 'buffer';

const generateBase64Credentials = () => {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
};

const createApolloClient = () => {
  const authCredentials = generateBase64Credentials();
  return new ApolloClient({
    uri: "https://data.waltti.fi/tampere/api/gtfsrealtime/v1.0/feed/servicealert",
    cache: new InMemoryCache(),
    headers: {
      Authorization: `Basic ${authCredentials}`,
    },
  });
};

export default createApolloClient;