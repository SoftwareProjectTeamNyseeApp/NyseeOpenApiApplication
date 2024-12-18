import { ApolloProvider } from '@apollo/client';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import createApolloClient from './src/utils/apolloClient';
import { ItineraryProvider } from './src/contexts/ItineraryContext';
import { UserLocationProvider } from './src/contexts/UserLocationContext';
import { SelectedItineraryProvider } from './src/contexts/SelectedItineraryContext';

import Home from './src/components/Home'; // Import the Home component
import DestinationSelect from './src/components/DestinationSelect';
import ItineraryDetails from './src/components/ItineraryDetails';
import Map from './src/components/Map';
import VehicleInformation from './src/components/VehicleInformation';
import SavedItineraries from './src/components/SavedItineraries';
import { AutocompleteDropdownContextProvider } from 'react-native-autocomplete-dropdown';

const Stack = createNativeStackNavigator();
const apolloClient = createApolloClient();

export default function App() {
  return (
    <AutocompleteDropdownContextProvider>
      <UserLocationProvider>
        <ItineraryProvider>
          <SelectedItineraryProvider>
            <NavigationContainer>
              <ApolloProvider client={apolloClient}>
                <Stack.Navigator initialRouteName="Home">
                    <Stack.Screen
                      name="Home"
                      component={Home}
                    />
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
                      name="SavedItineraries"
                      component={SavedItineraries}
                      options={{ title: 'Saved Itineraries' }}
                    />
                </Stack.Navigator>
              </ApolloProvider>
            </NavigationContainer>
          </SelectedItineraryProvider>
        </ItineraryProvider>
      </UserLocationProvider>
    </AutocompleteDropdownContextProvider>
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