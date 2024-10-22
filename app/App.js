import { ApolloProvider } from '@apollo/client';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import createApolloClient from './src/utils/apolloClient';
import { ItineraryProvider } from './src/contexts/ItineraryContext';

import DestinationSelect from './src/components/DestinationSelect';
import ItineraryDetails from './src/components/ItineraryDetails';

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
              />
              <Stack.Screen
                name="ItineraryDetails"
                component={ItineraryDetails}
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
