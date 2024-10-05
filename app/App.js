import { ApolloProvider } from '@apollo/client';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import Test from './src/components/Test';
import DestinationSelect from './src/components/DestinationSelect';
import createApolloClient from './src/utils/apolloClient';
import Constants from 'expo-constants';
import TestQuery from './src/components/TestQuery';

const apolloClient = createApolloClient();

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
     <View style={styles.container}>
        <Text>Hello Nysee!</Text>
        <StatusBar style="auto" />
        <DestinationSelect />
        {/* <Test /> */}
        {/* <TestQuery /> */}
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
