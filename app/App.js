import { ApolloProvider } from '@apollo/client';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Test from './src/components/Test';
import DestinationSelect from './src/components/DestinationSelect';
import createApolloClient from './src/utils/apolloClient';
import Constants from 'expo-constants';
import TestQuery from './src/components/TestQuery';
import ItineraryDetails from './src/components/ItineraryDetails';

const Stack = createNativeStackNavigator();
const apolloClient = createApolloClient();

export default function App() {
  return (
    <NavigationContainer>
      <ApolloProvider client={apolloClient}>
        <Stack.Navigator initialRouteName="DestinationSelect">
{/*           <View style={styles.container}>
            <Text>Hello Nysee!</Text>
            <StatusBar style="auto" /> */}
            {/* <DestinationSelect /> */}
            {/* <Test /> */}
            {/* <TestQuery /> */}
            <Stack.Screen name="DestinationSelect" component={DestinationSelect} />
            <Stack.Screen name="ItineraryDetails" component={ItineraryDetails} />
          {/* </View> */}
        </Stack.Navigator>

      </ApolloProvider>
    </NavigationContainer>
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
