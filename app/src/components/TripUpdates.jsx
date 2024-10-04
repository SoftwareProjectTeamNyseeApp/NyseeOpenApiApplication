import Constants from 'expo-constants';
import { Text, StyleSheet, View, FlatList } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_TRIP_UPDATES } from '../graphql/queries';

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flexGrow: 1,
    flexShrink: 1,
  },
});

const TripUpdates = () => {
  const { data, error, loading } = useQuery(GET_TRIP_UPDATES);

  if (loading) {
    return <Text>Loading...</Text>;
  }
  if (error) {
    console.error("Error fetching trip updates:", error);
    return <Text>Error! {JSON.stringify(error, null, 2)}</Text>; // Enhanced error logging
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.container}
        data={data.tripUpdates} // Ensure this matches the API response structure
        keyExtractor={(item) => item.trip.trip_id}
        renderItem={({ item }) => (
          <View>
            <Text>Trip ID: {item.trip.trip_id}</Text>
            <Text>Route ID: {item.trip.route_id}</Text>
            <Text>Vehicle ID: {item.vehicle.id}</Text>
            <Text>Start Time: {item.stop_time_update[0]?.arrival.time}</Text>
            <Text>Delay: {item.stop_time_update[0]?.arrival.delay}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default TripUpdates;