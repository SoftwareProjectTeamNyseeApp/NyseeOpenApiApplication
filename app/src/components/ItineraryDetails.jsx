import React from "react";
import { Text, View, FlatList, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  flexContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexItemResult: {
    flexGrow: 0,
    backgroundColor: 'lightblue',
    height: 600
  }
});

export default function ItineraryDetails({ route }) {
  const { data, number } = route.params;
  console.log("in details", data)
  return (
    <View style={styles.flexContainer}>
      <Text>Itinerary {number}</Text>
      <FlatList
        style={styles.flexItemResult}
        data={data}
        //keyExtractor={(item, index) => String(index)}
        renderItem={({ item }) => (
          <View>
            <Text>-------------</Text>
            <Text>Start time: {new Date(item.startTime).toLocaleString()}</Text>
            <Text>End time: {new Date(item.endTime).toLocaleString()}</Text>
            <Text>Mode: {item.mode}</Text>
            <Text>From: {item.from.name}</Text>
            <Text>To: {item.to.name}</Text>
            <Text>Distance: {(item.distance / 1000).toFixed(2)} km</Text>
            <Text>Duration: {(item.duration / 60).toFixed()} minutes</Text>
          </View>
        )}
      />
    </View>
  )
}