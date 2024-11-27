import React, { useCallback, useState } from "react";
import { Text, View, FlatList, StyleSheet, Pressable } from "react-native";
import { getItineraryTimeAndDuration } from "./DestinationSelect";
import { useItineraries } from "../contexts/ItineraryContext";
import moment from "moment";
import Map from "./Map";
import { useSelectedItinerary } from "../contexts/SelectedItineraryContext";
import { useFocusEffect } from "@react-navigation/native";

const styles = StyleSheet.create({
  flexContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexItemResult: {
    //flexGrow: 0,
    backgroundColor: 'lightblue',
    //height: 600,
    width: 300
  },
  innerList: {
    backgroundColor: 'lightblue',
    //flex: 1,
    paddingLeft: 20,
  },
  mapView: {
    width: 400,
    height: 300,
  },
  button: {
    backgroundColor: '#47a2ec',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 10,
    width: "75%"
  },
});

// get real time arrival and departure for intermediate stops, give scheduled time if not available
function getStopTime(time) {
  if (time.estimated) {
    //console.log("Delay", time.estimated.delay)
    return moment(time.estimated.time).format('HH:mm')
  } else {
    return moment(time.scheduledTime).format('HH:mm')
  }
}

// throws warning
// VirtualizedList: Encountered an error while measuring a list's offset from its containing VirtualizedList.
function getIntermediatePlaces(legs) {
  const intermediatePlaces = legs.intermediatePlaces

  return (
    <FlatList
      style={styles.innerList}
      data={intermediatePlaces}
      keyExtractor={item => item.stop.id}
      renderItem={({ item }) => (
        <View key={item.stop.id}>
          <Text>Name: {item.name} ({item.stop.code})</Text>
          <Text>Arrival time: {getStopTime(item.arrival)}</Text>
          <Text>Departure time: {getStopTime(item.departure)}</Text>
        </View>
      )}
    />
  )
}

const ItineraryDetails = ({ route }) => {
  const { itineraries } = useItineraries();
  const { itineraryId } = route.params;
  const selectedItinerary = itineraries.filter((itinerary) => itinerary.id === itineraryId)
  const [showIntermediatePlaces, setShowIntermediatePlaces] = useState(false)
  const {
    itinerary,
    setItinerary,
  } = useSelectedItinerary();

  useFocusEffect(
    useCallback(() => {
      // set itinerary when screen is focused
      setItinerary(selectedItinerary[0])
      return () => {
        // clear selected itinerary when screen becomes unfocused
        setItinerary(null)
      };
    }, [])
  );

  if (!itinerary) return null;

  return (
    <View style={styles.flexContainer}>
      <View style={styles.mapView}>
        <Map />
      </View>
      <Text>Itinerary {itineraryId}</Text>
      <Text>Time: {getItineraryTimeAndDuration(itinerary)}</Text>
      <Text>Walk distance: {(itinerary.walkDistance).toFixed()} meters ({(itinerary.walkTime / 60).toFixed()} min)</Text>
      <FlatList
        style={styles.flexItemResult}
        data={itinerary.legs}
        renderItem={({ item }) => (
          <View>
            <Text>-------------</Text>
            <Text>Start time: {getStopTime(item.start)}</Text>
            <Text>End time: {getStopTime(item.end)}</Text>
            <Text>Mode: {item.mode}</Text>
            {item.trip &&
              <Text>Line: {item.trip.routeShortName} (headsign: {item.trip.tripHeadsign})</Text>
            }
            <Text>From: {item.from.name} {item.from.stop && <Text>({item.from.stop.code})</Text>}</Text>
            <Text>To: {item.to.name}</Text>
            <Text>Distance: {(item.distance / 1000).toFixed(2)} km</Text>
            <Text>Duration: {(item.duration / 60).toFixed()} minutes</Text>
            {item.intermediatePlaces &&
              <Pressable
                onPress={() => setShowIntermediatePlaces(!showIntermediatePlaces)}
                style={styles.button}
              >
                <Text>{showIntermediatePlaces ? "Hide" : "Show"} intermediate stops</Text>
              </Pressable>
            }
            {item.intermediatePlaces && showIntermediatePlaces &&
              <Text>Intermediate Stops: {getIntermediatePlaces(item)}</Text>
            }
          </View>
        )}
      />
    </View>
  )
}

export default ItineraryDetails;