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
  if (!dateTimeString) return "Now";
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

function getLastStops({itinerary}) {
  let lastStopsArray = []
  for (let i = 0; i < itinerary.legs.length; i++) {
    if (itinerary.legs[i].trip && itinerary.legs[i].to.stop) {
      lastStopsArray.push({
        stopCode: itinerary.legs[i].to.stop.code,
        line: itinerary.legs[i].trip.routeShortName
      })
    }
  }
  return lastStopsArray
}

function filterVehicleData({vehicleInformation, originDepartureData}) {
  let filteredStopsData = [];
  // filter vehicleinformation based on origin aimed departure time from first stop of the route
  // from graphQL, the data is in "seconds from midnight", timezone is local
  // from ITS Journeys, data is in HHmm, e.g. 2030, timezone is UTC+0

  // if departure time from origin is same for both and lines are same, push to array
  for (let i = 0; i < originDepartureData.length; i++) {
    for (let j = 0; j < vehicleInformation.length; j++) {
      const originDepartureTime = moment.utc(originDepartureData[i].scheduledDeparture * 1000).format('HH:mm')
      const originAimedDepartureTime = moment.utc(vehicleInformation[j].details.originAimedDepartureTime, 'HHmm').toDate()
      const originAimedDepartureTimeCorrectTimeZone = moment(originAimedDepartureTime).format('HH:mm')
      const firstLineToCompare = originDepartureData[i].trip.routeShortName
      const secondLineToCompare = vehicleInformation[j].line
      const firstDirectionToCompare = (parseInt(originDepartureData[i].trip.directionId) + 1).toString()
      const secondDirectionToCompare = vehicleInformation[j].details.directionRef
      //console.log("FOR GRAPHQL", i, "TIME IS", originDepartureTime, "FOR LINE/DIR", firstLineToCompare,"/",firstDirectionToCompare, "AND FOR ITS", j, "TIME IS", originAimedDepartureTimeCorrectTimeZone, "FOR LINE/DIR", secondLineToCompare,"/", secondDirectionToCompare)
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

function filterByLastStop({lastStopsOfTrips, filteredVehicleInformation}) {
  for (let i = 0; i < filteredVehicleInformation.length; i++) {
    if (lastStopsOfTrips[i]) {
      if (filteredVehicleInformation[i].line === lastStopsOfTrips[i].line) {
        // find index of last stop for trip and remove stops from array after that stop
        const indexOfLastStop = filteredVehicleInformation[i].details.onwardCalls.findIndex(isLastStop)
        filteredVehicleInformation[i].details.onwardCalls.splice(indexOfLastStop + 1)

        function isLastStop(element) {
          if (element.stopPointRef.slice(-4) === lastStopsOfTrips[i].stopCode) return true;
          return false
        }
      }
    }
  }
  return filteredVehicleInformation
}

async function getStopsData(vehicleInformation) {
  let stopsDataArray = [];
  // Check if onwardsCalls exists and is an array
  for (let i = 0; i < vehicleInformation.length; i++) {
    if (Array.isArray(vehicleInformation[i].details.onwardCalls)) {
      const busInfo = vehicleInformation[i].details.onwardCalls;

      // Fetch stop names for each stopPointRef
      const stopsData = await Promise.all(busInfo.map(async (call) => {
        const stopName = await getStopPointName(call.stopPointRef);
        const stopCode = call.stopPointRef.slice(-4)
        return {
          stopName, // Use the fetched stop name
          stopCode: stopCode,
          expectedArrivalTime: formatTime(call.expectedArrivalTime),
          expectedDepartureTime: formatTime(call.expectedDepartureTime)
        };
      }));
      stopsDataArray.push({
        line: vehicleInformation[i].line,
        stops: stopsData
      });
    }
  }
  return stopsDataArray
}

function getTimeUntilDisembark(lastStop) {
  let timeUntilDisembark = '';
  if (lastStop) {
    const arrivalTime = lastStop[0].expectedArrivalTime
    let arrivalTimeMoment = moment(arrivalTime, 'HH:mm:ss')
    // milliseconds until arrival, current time subtracted from arrival time
    const msUntilArrival = moment(arrivalTimeMoment).valueOf() - moment().valueOf()

    // could add seconds too
    const minutesUntilDisembark = Math.floor(msUntilArrival / (1000 * 60))

    if (minutesUntilDisembark >= 0) {
      timeUntilDisembark = `in ${minutesUntilDisembark} min`
    } else {
      timeUntilDisembark = 'now'
    }
  }
  return timeUntilDisembark
}

const DisembarkComponent = ({stopsData}) => {
  if (stopsData.length === 0) return null;

  let lastStop = null;
  let timeUntilDisembark = '';

  for (let i = 0; i < stopsData.length; i++) {
    if (stopsData[i].stops.length > 0) {
      lastStop = stopsData[i].stops.slice(-1)
      break;
    }
  }

  if (!lastStop) return null;

  timeUntilDisembark = getTimeUntilDisembark(lastStop)

  return (
    <View style={styles.disembarkView}>
      <Text style={{ textAlign: 'center' }}>Disembark {timeUntilDisembark} at stop {lastStop[0].stopName} ({lastStop[0].stopCode})</Text>
    </View>
  )
}

const StopTimeModal = (itinerary) => {
  const { vehicleInformation } = useSelectedItinerary();
  const [stopsData, setStopsData] = useState([]); // New state for stops data
  const [isMenuVisible, setMenuVisible] = useState(false);
  // origin departure data from itinerary for filtering vehicle information and stops data
  const [originDepartureData, setOriginDepartureData] = useState([]);
  // last stops of trips done by vehicles, where user should disembark
  const [lastStopsOfTrips, setLastStopsOfTrips] = useState([]);

  useEffect(() => {
    if (itinerary) {
      const originDepartureStopData = getOriginDepartureStopData(itinerary)
      setOriginDepartureData(originDepartureStopData)
    }
  }, [])

  useEffect(() => {
    if (itinerary) {
      const lastStops = getLastStops(itinerary)
      setLastStopsOfTrips(lastStops)
    }
  }, [])

  useEffect(() => {
    if (vehicleInformation.length > 0) {
      const getCurrentStopsData = async () => {
        const filteredVehicleInformation = filterVehicleData({vehicleInformation, originDepartureData})
        const filteredByLastStop = filterByLastStop({lastStopsOfTrips, filteredVehicleInformation})
        const fetchedfilteredStopsData = await getStopsData(filteredByLastStop)
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
            <Text style={styles.menuTitle}>Realtime stops data</Text>
            <DisembarkComponent stopsData={stopsData} />
            <ScrollView>
              {stopsData.length > 0 ? (
                stopsData.map((data, index) => (
                  data.stops.length > 0 ? (
                    <View key={index} style={styles.stopContainer}>
                      <Text style={styles.stopHeader}>Stops for line {data.line}</Text>
                      <View>
                        {stopsData[index].stops.map((stop, indexTwo) => (
                          <View key={indexTwo} style={styles.stopItem}>
                          <Text style={{fontWeight: 'bold'}}>{stop.stopName} ({stop.stopCode})</Text>
                          <Text>Expected Arrival: {stop.expectedArrivalTime}</Text>
                          <Text>Expected Departure: {stop.expectedDepartureTime}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : (
                    <></>
                  )
                ))
              ) : (
                <View style={styles.stopItem}>
                  <Text>No real time data available for this itinerary</Text>
                </View>
              )}
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
    left: 60,
    bottom: 20,
    //right: 20,
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
    height: '60%',
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
  stopContainer: {
    marginBottom: 10,
    padding: 6,
    backgroundColor: '#d0d0d0',
    borderRadius: 5,
  },
  stopHeader: {
    marginBottom: 10,
    padding: 5,
    paddingLeft: 10,
    backgroundColor: '#404040',
    borderRadius: 5,
    color: '#ffffff',
    fontWeight: 'bold',
    fontVariant: 'small-caps',
  },
  disembarkView: {
    padding: 6,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10,
  }
});

export default ItineraryDetails;