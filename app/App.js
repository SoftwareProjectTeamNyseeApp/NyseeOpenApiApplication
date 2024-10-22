import { ApolloProvider } from '@apollo/client';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Test from './src/components/Test';
import DestinationSelect from './src/components/DestinationSelect';
import Map from './src/components/Map';
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
            <Stack.Screen
              name="DestinationSelect"
              component={DestinationSelect}
              options={{ title: 'Select Destination' }}
            />
            <Stack.Screen
              name="ItineraryDetails"
              component={ItineraryDetails}
              options={{ title: 'Itinerary Details' }}
            />
            <Stack.Screen
              name="Map"
              component={Map}
              options={{ title: 'Map View' }}
            />
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
