import Constants from 'expo-constants';
import { Text, StyleSheet, View, FlatList } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_TEST_ITINERARY } from '../graphql/queries';

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flexGrow: 1,
    flexShrink: 1,
  },
});

const Test = () => {
  const { data, error, loading } = useQuery(GET_TEST_ITINERARY);

  if (loading) {
    return <Text>Loading...</Text>
  }
  if (error) {
    return <Text>Error! ${error.message}</Text>
  }
  console.log(data.plan.itineraries[0].legs[0])

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.container}
        data={data.plan.itineraries[0].legs}
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item }) => (
          <View>
            <Text>Start time: {item.startTime}</Text>
            <Text>End time: {item.endTime}</Text>
            <Text>Mode: {item.mode}</Text>
            <Text>Distance: {item.distance}</Text>
            <Text>Duration: {item.duration}</Text>
          </View>
        )}
      />
    </View>

  );
};

export default Test;