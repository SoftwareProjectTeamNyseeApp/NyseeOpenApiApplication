import { ApolloClient, InMemoryCache } from '@apollo/client';
import Constants from 'expo-constants';
import { Buffer } from 'buffer';


// Function to generate Base64 encoded credentials
const generateBase64Credentials = () => {
  const clientId = process.env.CLIENT_ID; // Read from .env
  const clientSecret = process.env.CLIENT_SECRET; // Read from .env
  return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
};

const createApolloClient = () => {
  const authCredentials = generateBase64Credentials();
  return new ApolloClient({
    uri: "https://data.waltti.fi/tampere/api/gtfsrealtime/v1.0/feed/servicealert",
    cache: new InMemoryCache(),
    headers: {
      Authorization: `Basic ${authCredentials}`,
      'Accept': 'application/x-protobuf', // Accept Protobuf response
    },
    fetchOptions: {
      method: 'GET', // Ensure GET method is used
    },
  });
};

export default createApolloClient;