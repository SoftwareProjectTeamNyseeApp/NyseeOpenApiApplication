import { ApolloClient, InMemoryCache } from '@apollo/client';
import Constants from 'expo-constants';

const createApolloClient = () => {
  console.log(`https://api.digitransit.fi/routing/v1/routers/finland/index/graphql?${Constants.expoConfig.extra.api_name}=${Constants.expoConfig.extra.api_key}`)
  return new ApolloClient({
    //uri: 'https://api.digitransit.fi/routing/v1/routers/finland/index/graphql?digitransit-subscription-key=c6dedbf8581e4986b5e21fbedd93e730',
    uri: `https://api.digitransit.fi/routing/v1/routers/finland/index/graphql?${Constants.expoConfig.extra.api_name}=${Constants.expoConfig.extra.api_key}`,
    cache: new InMemoryCache(),
  });
};

export default createApolloClient;