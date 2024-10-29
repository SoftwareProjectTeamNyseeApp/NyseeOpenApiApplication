import { ApolloProvider } from '@apollo/client';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import createApolloClient from './src/utils/apolloClient';
import { ItineraryProvider } from './src/contexts/ItineraryContext';

import DestinationSelect from './src/components/DestinationSelect';
import ItineraryDetails from './src/components/ItineraryDetails';
import Map from './src/components/Map';
import Test from './src/components/Test';
import VehicleInformation from './src/components/VehicleInformation';

const Stack = createNativeStackNavigator();
const apolloClient = createApolloClient();

export default function App() {
  return (
    <ItineraryProvider>
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
                name="VehicleInfo"
                component={VehicleInformation}
                options={{ title: 'VehicleInfoView' }}
              />
              <Stack.Screen
                name="Map"
                component={Map}
                options={{ title: 'Map View' }}
              />
              <Stack.Screen
                name="Test"
                component={Test}
                options={{ title: 'Test View' }}
              />
          </Stack.Navigator>
        </ApolloProvider>
      </NavigationContainer>
    </ItineraryProvider>
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
