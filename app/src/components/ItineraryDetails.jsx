import React, { useCallback, useEffect, useState } from "react";
import { Text, View, FlatList, StyleSheet, Pressable, Modal, ScrollView, Button } from "react-native";
import { getItineraryTimeAndDuration } from "./DestinationSelect";
import { useItineraries } from "../contexts/ItineraryContext";
import moment from "moment";
import Map from "./Map";
import { useSelectedItinerary } from "../contexts/SelectedItineraryContext";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const formatTime = (dateTimeString) => {
  if (!dateTimeString) return "N/A"; // Handle cases where time might be undefined
  const timePart = moment(dateTimeString).format('HH:mm:ss')
  return timePart
};

const getStopPointName = async (stopPointRef) => {
  try {
    const response = await fetch(stopPointRef);
    const json = await response.json();
    return json.body[0].name; // Assuming the response structure
  } catch (error) {
    console.error("Error fetching stop point details:", error);
    return "Unknown Stop"; // Fallback name
  }
};

function getOriginDepartureStopData({itinerary}) {
  // get origin departure stop time and other data to compare and filter vehicleinformation
  let departureFromOriginStop = [];
  for (let i = 0; i < itinerary.legs.length; i++) {
    if (itinerary.legs[i].trip) {
      departureFromOriginStop.push(itinerary.legs[i].trip.departureStoptime)
    }
  }
  return departureFromOriginStop
}

async function filterVehicleData({vehicleInformation, originDepartureData}) {
  let filteredStopsData = [];
  // filter vehicleinformation based on origin aimed departure time from first stop of the route
  // from graphQL, the data is in "seconds from midnight", timezone is local
  // from ITS Journeys, data is in HHmm, e.g. 2030, timezone is UTC+0

  // if departure time from origin is same for both and lines are same, push to array
  for (let i = 0; i < originDepartureData.length; i++) {
    for (let j = 0; j < vehicleInformation.length; j++) {
      const originDepartureTime = moment.utc(originDepartureData[i].scheduledDeparture * 1000).format('HH:mm')
      //console.log("origin in seconds", originDepartureData[i].scheduledDeparture)
      //console.log("ORIGINDEPARTUREITME", originDepartureTime)
      const originAimedDepartureTime = moment.utc(vehicleInformation[j].details.originAimedDepartureTime, 'HHmm').toDate()
      const originAimedDepartureTimeCorrectTimeZone = moment(originAimedDepartureTime).format('HH:mm')
      const firstLineToCompare = originDepartureData[i].trip.routeShortName
      const secondLineToCompare = vehicleInformation[j].line
      const firstDirectionToCompare = (parseInt(originDepartureData[i].trip.directionId) + 1).toString()
      const secondDirectionToCompare = vehicleInformation[j].details.directionRef
      console.log("FOR GRAPHQL", i, "TIME IS", originDepartureTime, "FOR LINE/DIR", firstLineToCompare,"/",firstDirectionToCompare, "AND FOR ITS", j, "TIME IS", originAimedDepartureTimeCorrectTimeZone, "FOR LINE/DIR", secondLineToCompare,"/", secondDirectionToCompare)
      // is there a need to add a minute or two of leeway?
      if (originDepartureTime === originAimedDepartureTimeCorrectTimeZone) {
        if (firstLineToCompare === secondLineToCompare && firstDirectionToCompare && secondDirectionToCompare) {
          console.log("TRUE FOR", i, "AND", j, "WHERE TIME IS", originDepartureTime, "/", originAimedDepartureTimeCorrectTimeZone, "FOR LINE", originDepartureData[i].trip.routeShortName, "/", vehicleInformation[j].line)
          filteredStopsData.push(vehicleInformation[j])
        }
      }
    }
  }

  console.log("FILTERED", filteredStopsData)
  console.log("FILTERED LENGTH", filteredStopsData.length)

  return filteredStopsData
}

async function getStopsData(vehicleInformation) {
  console.log("VEH INFO", vehicleInformation.length)
  // Check if onwardsCalls exists and is an array
  for (let i = 0; i < vehicleInformation.length; i++) {
    if (Array.isArray(vehicleInformation[i].details.onwardCalls)) {
      const busInfo = vehicleInformation[i].details.onwardCalls;

      // Fetch stop names for each stopPointRef
      const stopsData = await Promise.all(busInfo.map(async (call) => {
        const stopName = await getStopPointName(call.stopPointRef);
        return {
          stopName, // Use the fetched stop name
          expectedArrivalTime: formatTime(call.expectedArrivalTime),
          expectedDepartureTime: formatTime(call.expectedDepartureTime)
        };
      }));
      console.log("STOPSDATA", stopsData)
      return stopsData;
    }
  }

  return []
}

const StopTimeModal = (itinerary) => {
  const { vehicleInformation } = useSelectedItinerary();
  const [stopsData, setStopsData] = useState([]); // New state for stops data
  const [isMenuVisible, setMenuVisible] = useState(false);
  // origin departure data from itinerary for filtering vehicle information and stops data
  const [originDepartureData, setOriginDepartureData] = useState([]);

  useEffect(() => {
    if (itinerary) {
      const originDepartureStopData = getOriginDepartureStopData(itinerary)
      setOriginDepartureData(originDepartureStopData)
    }
  }, [])

  useEffect(() => {
    console.log("ORIGINDEPDATA", originDepartureData)
  }, [originDepartureData])

  useEffect(() => {
    if (vehicleInformation.length > 0) {
      const getCurrentStopsData = async () => {
        //const fetchedStopsData = await getStopsData(vehicleInformation)
        //setStopsData(fetchedStopsData)
        const filteredVehicleInformation = await filterVehicleData({vehicleInformation, originDepartureData})
        const fetchedfilteredStopsData = await getStopsData(filteredVehicleInformation)
        setStopsData(fetchedfilteredStopsData)
      }
      getCurrentStopsData()
    }
  }, [vehicleInformation])

  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible);
  };

  return (
    <View style={{ flex: 1 }}>
      <Pressable style={styles.menuButton} onPress={toggleMenu}>
        <Text style={styles.buttonText}>Details</Text>
      </Pressable>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={toggleMenu}
      >
        <View style={styles.menuContainer}>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Vehicle Details</Text>
            <ScrollView>
              {stopsData.length > 0 ? (
                stopsData.map((stop, index) => (
                  <View key={index} style={styles.stopItem}>
                    <Text>Stop Name: {stop.stopName}</Text>
                    <Text>Expected Arrival: {stop.expectedArrivalTime}</Text>
                    <Text>Expected Departure: {stop.expectedDepartureTime}</Text>
                  </View>))
                ) : (
                  <View style={styles.stopItem}>
                    <Text>No real time data available yet for this itinerary</Text>
                  </View>
                )
              }
            </ScrollView>
            <Button title="Close" onPress={toggleMenu} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// get real time arrival and departure for intermediate stops, give scheduled time if not available
function getStopTime(time) {
  if (time.estimated) {
    //console.log("Delay", time.estimated.delay)
    return moment(time.estimated.time).format('HH:mm')
  } else {
    return moment(time.scheduledTime).format('HH:mm')
  }
}

const IntermediatePlaces = ({legs}) => {
  const intermediatePlaces = legs.intermediatePlaces

  return (
    <>
      <Text>Intermediate stops:</Text>
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
    </>

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
    <SafeAreaProvider>
      <SafeAreaView>
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
                  <IntermediatePlaces legs={item} />
                }
              </View>
            )}
          />
          <StopTimeModal itinerary={itinerary}/>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  flexContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexItemResult: {
    flexGrow: 0,
    backgroundColor: 'lightblue',
    height: "48%",
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
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  },
  menuButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContent: {
    width: '80%',
    height: '50%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  stopItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
});

export default ItineraryDetails;