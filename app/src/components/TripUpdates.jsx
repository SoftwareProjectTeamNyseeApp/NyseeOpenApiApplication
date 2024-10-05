import { Text, StyleSheet, View, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import protobuf from 'protobufjs';
import { Buffer } from 'buffer'; // Import Buffer from the buffer package
import { GET_TRIP_UPDATES } from '../graphql/queries'; // Import the query

// Function to generate Base64 encoded credentials
const generateBase64Credentials = () => {
  const clientId = process.env.CLIENT_ID; // Read from .env
  const clientSecret = process.env.CLIENT_SECRET; // Read from .env
  return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
};

const TripUpdates = () => {
  const [tripUpdates, setTripUpdates] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTripUpdates = async () => {
      try {
        const client = new ApolloClient({
          link: new HttpLink({
            uri: "https://data.waltti.fi/tampere/api/gtfsrealtime/v1.0/feed/tripupdate",
            fetchOptions: {
              method: 'GET',
            },
            headers: {
              Authorization: `Basic ${generateBase64Credentials()}`,
              'Accept': 'application/x-protobuf',
            },
          }),
          cache: new InMemoryCache(),
        });

        const response = await client.query({
          query: GET_TRIP_UPDATES,
        });

        // Load the protobuf schema
        protobuf.load('path/to/gtfs-realtime.proto', (err, root) => {
          if (err) throw err;

          const FeedMessage = root.lookupType('transit_realtime.FeedMessage');

          // Decode the protobuf data
          const message = FeedMessage.decode(new Uint8Array(response.data));
          const object = FeedMessage.toObject(message, {
            longs: String,
            enums: String,
            bytes: String,
          });

          setTripUpdates(object.tripUpdates); // Set the decoded trip updates
        });
      } catch (err) {
        console.error("Error fetching trip updates:", err);
        setError(err);
      }
    };

    fetchTripUpdates();
  }, []);

  if (error) {
    return (
      <View>
        <Text>Error! {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tripUpdates}
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

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
});

export default TripUpdates;