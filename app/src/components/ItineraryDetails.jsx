import React, { useEffect } from "react";
import { Text, View, FlatList, StyleSheet } from "react-native";
import { getItineraryTimeAndDuration } from "./DestinationSelect";
import { useItineraries } from "../contexts/ItineraryContext";
import moment from "moment";
import Map from "./Map";
import { useState } from "react";

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

async function getVehicleInformation(line) {
  const baseUrl = "https://data.itsfactory.fi/journeys/api/1";
  const apiUrl = `${baseUrl}/vehicle-activity?lineRef=${line}`;
  console.log("URL", apiUrl)
    try {
      const response = await fetch(apiUrl);
      const json = await response.json();
      console.log("RESPONSE", response)
      //console.log("JSON", json)
      if (json.body.length > 0) {
        const vehicleData = json.body[0].monitoredVehicleJourney;
        return ({
          latitude: vehicleData.vehicleLocation.latitude,
          longitude: vehicleData.vehicleLocation.longitude,
          details: vehicleData, // Store vehicle details
        });
      }
    } catch (error) {
      console.error("Error fetching vehicle activity:", error);
    }
}

function getLines (itinerary) {
  const legs = itinerary.legs
  let lineNumbers = []
  // if legs has a trip, save trip.routeShortName (line) to an array
  for (let i = 0; i < legs.length; i++) {
    if (legs[i].trip) {
      lineNumbers.push(parseInt(legs[i].trip.routeShortName))
    }
  }
  if (lineNumbers.length > 0) {
    return lineNumbers
  }
  else {
    return null
  }
}

const ItineraryDetails = ({ route }) => {
  const { itineraries } = useItineraries();
  const { itineraryId } = route.params;
  const selectedItinerary = itineraries.filter((itinerary) => itinerary.id === itineraryId)
  const [lines, setLines] = useState([])
  const [vehicleInformation, setVehicleInformation] = useState([])

  // get current lines
  // could use vehicleRef or something to get the correct vehicles for the itinerary
  useEffect(() => {
    const fetchedLines = getLines(selectedItinerary[0])
    setLines(fetchedLines);
  }, [])

  useEffect(() => {
    const getCurrentVehicleInformation = async () => {
      // NOTE: only fetches for first line
      // TODO: allow multiple lines to be shown on map
      const fetchedInformation = await getVehicleInformation(lines)
      setVehicleInformation(fetchedInformation);
    }
    if (lines.length > 0) {
      // polling API every 5 seconds
      // NOTE: should somehow clear this so it doesn't keep polling when user changes itineraries
      // eg. clearInterval
      // maybe react query is better for polling than using setInterval
      setInterval(getCurrentVehicleInformation, 5000);
    }
  }, [lines])

  return (
    <View style={styles.flexContainer}>
      <View style={styles.mapView}>
        <Map vehicleLocation={vehicleInformation} />
      </View>
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

export default ItineraryDetails;