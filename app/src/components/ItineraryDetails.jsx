import React from "react";
import { Text, View, FlatList, StyleSheet } from "react-native";
import { getItineraryTimeAndDuration } from "./DestinationSelect";
import { useItineraries } from "../contexts/ItineraryContext";
import moment from "moment";

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
  },
  innerList: {
    backgroundColor: 'lightblue',
    flex: 1,
    paddingLeft: 20
  }
});

// throws warning
// VirtualizedList: Encountered an error while measuring a list's offset from its containing VirtualizedList.
function getIntermediatePlaces(legs) {
  const intermediatePlaces = legs.intermediatePlaces
  for (let i = 0; i < intermediatePlaces.length; i++) {
    console.log("Name", intermediatePlaces[i].name)
    console.log("Stop code", intermediatePlaces[i].stop.code)
    console.log("Arrival time", moment(intermediatePlaces[i].arrivalTime).format('HH:mm'))
    console.log("Departure time", moment(intermediatePlaces[i].departureTime).format('HH:mm'))
  }
  return (
    <FlatList
      style={styles.innerList}
      data={intermediatePlaces}
      renderItem={({ item }) => (
        <View>
          <Text>Name: {item.name} ({item.stop.code})</Text>
          <Text>Arrival time: {moment(item.arrivalTime).format('HH:mm')}</Text>
          <Text>Departure time: {moment(item.departureTime).format('HH:mm')}</Text>
        </View>
      )}
    />
  )
}

export default function ItineraryDetails({ route }) {
  const { itineraries } = useItineraries();
  const { itineraryId } = route.params;
  const selectedItinerary = itineraries.filter((itinerary) => itinerary.id === itineraryId)
  console.log("selected itinerary", selectedItinerary)

  return (
    <View style={styles.flexContainer}>
      <Text>Itinerary {itineraryId}</Text>
      <Text>Time: {getItineraryTimeAndDuration(selectedItinerary[0])}</Text>
      <Text>Walk distance: {(selectedItinerary[0].walkDistance).toFixed()} meters ({(selectedItinerary[0].walkTime / 60).toFixed()} min)</Text>
      <FlatList
        style={styles.flexItemResult}
        data={selectedItinerary[0].legs}
        renderItem={({ item }) => (
          <View>
            <Text>-------------</Text>
            <Text>Start time: {moment(item.startTime).format('HH:mm')}</Text>
            <Text>End time: {moment(item.endTime).format('HH:mm')}</Text>
            <Text>Mode: {item.mode}</Text>
            {item.trip &&
              <Text>Line: {item.trip.routeShortName} (headsign: {item.trip.tripHeadsign})</Text>
            }
            <Text>From: {item.from.name} {item.from.stop && <Text>({item.from.stop.code})</Text>}</Text>
            <Text>To: {item.to.name}</Text>
            <Text>Distance: {(item.distance / 1000).toFixed(2)} km</Text>
            <Text>Duration: {(item.duration / 60).toFixed()} minutes</Text>
            {item.intermediatePlaces.length > 0 &&
              <Text>Intermediate Places: {getIntermediatePlaces(item)}</Text>
            }
          </View>
        )}
      />
    </View>
  )
}