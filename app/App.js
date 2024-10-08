import { ApolloProvider } from '@apollo/client';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import Test from './src/components/Test';
import createApolloClient from './src/utils/apolloClient';
import Constants from 'expo-constants';

const apolloClient = createApolloClient();

export default function App() {
  console.log(Constants.expoConfig.extra.api_name);
  console.log(Constants.expoConfig.extra.api_key)
  return (
    <ApolloProvider client={apolloClient}>
     <View style={styles.container}>
        <Text>Hello Nysee!</Text>
        <StatusBar style="auto" />
        <Test />
      </View>
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
