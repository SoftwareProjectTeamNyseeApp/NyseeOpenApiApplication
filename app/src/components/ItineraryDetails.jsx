import React from "react";
import { Text, View, FlatList, StyleSheet } from "react-native";
import { getItineraryTimeAndDuration } from "./DestinationSelect";

const styles = StyleSheet.create({
  flexContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexItemResult: {
    flexGrow: 0,
    backgroundColor: 'lightblue',
    height: 600,
    width: 300
  }
});

export default function ItineraryDetails({ route }) {
  const { data, number } = route.params;
  console.log("in details", data)
  return (
    <View style={styles.flexContainer}>
      <Text>Itinerary {number}</Text>
      <Text>Time: {getItineraryTimeAndDuration(data)}</Text>
      <FlatList
        style={styles.flexItemResult}
        data={data}
        //keyExtractor={(item, index) => String(index)}
        renderItem={({ item }) => (
          <View>
            <Text>-------------</Text>
            <Text>Start time: {new Date(item.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
            <Text>End time: {new Date(item.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
            <Text>Mode: {item.mode}</Text>
            <Text>From: {item.from.name} {item.from.stop && <Text>({item.from.stop.code})</Text>}</Text>
            <Text>To: {item.to.name}</Text>
            <Text>Distance: {(item.distance / 1000).toFixed(2)} km</Text>
            <Text>Duration: {(item.duration / 60).toFixed()} minutes</Text>
          </View>
        )}
      />
    </View>
  )
}