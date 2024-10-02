import { ApolloClient, InMemoryCache } from '@apollo/client';
import Constants from 'expo-constants';

const createApolloClient = () => {
  return new ApolloClient({
    uri: `https://api.digitransit.fi/routing/v1/routers/finland/index/graphql?${Constants.expoConfig.extra.api_name}=${Constants.expoConfig.extra.api_key}`,
    cache: new InMemoryCache(),
  });
};

export default createApolloClient;