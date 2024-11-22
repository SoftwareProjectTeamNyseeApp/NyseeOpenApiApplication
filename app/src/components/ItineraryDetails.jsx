import React, { useEffect } from "react";
import { Text, View, FlatList, StyleSheet } from "react-native";
import { getItineraryTimeAndDuration } from "./DestinationSelect";
import { useItineraries } from "../contexts/ItineraryContext";
import moment from "moment";
import Map from "./Map";
import { useState } from "react";
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

async function getVehicleInformation({lines, directions}) {
  const baseUrl = "https://data.itsfactory.fi/journeys/api/1";
  //const apiUrl = `${baseUrl}/vehicle-activity?lineRef=${lines[0]}&directionRef=${directions[0]}`
  // for multiple URLs
  let apiUrl = []
  for (let i = 0; i < directions.length; i++) {
    apiUrl.push(`${baseUrl}/vehicle-activity?lineRef=${lines[i]}&directionRef=${directions[i]}`)
  }
  //console.log("URL", apiUrl)

  // fetch data from multiple URLs
  const fetchUrls = async (urls) => {
    try {
      const promises = urls.map(url => fetch(url));
      const responses = await Promise.all(promises);
      const data = await Promise.all(responses.map(response => response.json()));
      return data
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error}`)
    }
  }

  const vehicleData = fetchUrls(apiUrl)
    .then(data => {
      const dataFlat = data.flatMap(d => d.body)

      if (dataFlat.length > 0) {
        const tempVehicleData = dataFlat.map((d) => {
          return({
            latitude: d.monitoredVehicleJourney.vehicleLocation.latitude,
            longitude: d.monitoredVehicleJourney.vehicleLocation.longitude,
            line: d.monitoredVehicleJourney.lineRef,
            details: d.monitoredVehicleJourney
          })
        })
        return tempVehicleData
      }
    })
    .catch(error => {
      console.error("Error fetching data:", error)
    });

  return vehicleData
}

const ItineraryDetails = ({ route }) => {
  const { itineraries } = useItineraries();
  const { itineraryId } = route.params;
  const selectedItinerary = itineraries.filter((itinerary) => itinerary.id === itineraryId)
  const {
    itinerary,
    setItinerary,
    lines,
    directions,
    //vehicleInformation,
  } = useSelectedItinerary();

  const [vehicleInformation, setVehicleInformation] = useState([])

  useEffect(() => {
    setItinerary(selectedItinerary[0])
  }, [selectedItinerary])

  useEffect(() => {
    // TODO: does not immediately fetch, so marker takes a while to show up on the map
    const getCurrentVehicleInformation = async () => {
      const fetchedInformation = await getVehicleInformation({lines, directions})
      setVehicleInformation(fetchedInformation);
    }
    if (lines?.length > 0) {
      // polling API every 2 seconds
      // NOTE: should somehow clear this so it doesn't keep polling when user changes itineraries
      // eg. clearInterval
      // maybe react query is better for polling than using setInterval
      setInterval(getCurrentVehicleInformation, 2000);
      //getCurrentVehicleInformation()
    }
  }, [lines])

  if (!itinerary) return null;

  return (
    <View style={styles.flexContainer}>
      <View style={styles.mapView}>
        <Map vehicleInformation={vehicleInformation} />
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