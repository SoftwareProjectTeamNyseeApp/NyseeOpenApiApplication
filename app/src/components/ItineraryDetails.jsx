import React, { useEffect } from "react";
import { Text, View, FlatList, StyleSheet } from "react-native";
import { getItineraryTimeAndDuration } from "./DestinationSelect";
import { useItineraries } from "../contexts/ItineraryContext";
import moment from "moment";
import Map from "./Map";
import { useSelectedItinerary } from "../contexts/SelectedItineraryContext";

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
  },
  mapView: {
    width: 400,
    height: 300,
  }
});

// throws warning
// VirtualizedList: Encountered an error while measuring a list's offset from its containing VirtualizedList.
function getIntermediatePlaces(legs) {
  const intermediatePlaces = legs.intermediatePlaces
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

const ItineraryDetails = ({ route }) => {
  const { itineraries } = useItineraries();
  const { itineraryId } = route.params;
  const selectedItinerary = itineraries.filter((itinerary) => itinerary.id === itineraryId)
  const {
    itinerary,
    setItinerary,
  } = useSelectedItinerary();

  useEffect(() => {
    setItinerary(selectedItinerary[0])
  }, [selectedItinerary])

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

export default ItineraryDetails;