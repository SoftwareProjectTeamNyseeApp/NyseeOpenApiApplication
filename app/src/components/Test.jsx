import Constants from 'expo-constants';
import { Button, Text, StyleSheet, View, FlatList, Pressable, TextInput, SafeAreaView } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_TEST_ITINERARY } from '../graphql/queries';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from 'react';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flexGrow: 1,
    flexShrink: 1,
    height: 100
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  list: {
    flexGrow: 1,
    borderColor: 'red',
    borderWidth: 1,
    height: 400,
    width: "100%"
  }
});


const VehicleActivity = () => {
  // example API req: https://data.itsfactory.fi/journeys/api/1/vehicle-activity?lineRef=38
  // /api/1/vehicle-activity
  // - lineRef: string or comma separated list, eg. lineRef=3 or lineRef=3,1*
  // - vehicleRef
  // - journeyRef ([lineId]_[start time as HHmm]_[first stop id]_[last stop id], eg. 2_2230_0001_1234)
  // - directionRef: 1 or 2
  // can exclude fields with exclude-fields parameter, comma-separated list for multiple fields
  // eg. http://data.itsfactory.fi/journeys/api/1/vehicle-activity?exclude-fields=monitoredVehicleJourney.onwardCalls,recordedAtTime

  const baseUrl = "https://data.itsfactory.fi/journeys/api/1"
  const [text, onChangeText] = useState('')
  const [vehicleActivity, setVehicleActivity] = useState([])

  //const getVehicleActivity = async (line) => {
  async function getVehicleActivity(line) {
    console.log("Getting vehicle activity for line", line)
    const apiUrl = `${baseUrl}/vehicle-activity?lineRef=${line}`
    console.log("apiurl", apiUrl)
    try {
      const response = await fetch(apiUrl);
      const json = await response.json();
      console.log("response json body", json.body)
      setVehicleActivity(json.body)
    } catch (error) {
      console.error("Error fetching vehicle activity:", error);
    }
  }

  if (vehicleActivity.length > 0) {
    console.log("vehicleactivity", vehicleActivity[0].recordedAtTime)
  }

  return (
      <SafeAreaView style={styles.container}>
        <Text>Get vehicle activity for line:</Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          value={text}
          placeholder="line number, eg. 2"
        />
        <Pressable onPress={() => {getVehicleActivity(text)}}>
          <Text>Press to get vehicle activity</Text>
        </Pressable>
        {vehicleActivity.length > 0 &&
          <View>
            <Text>Data returned!</Text>
            <FlatList
              style={styles.list}
              data={vehicleActivity}
              keyExtractor={(item, index) => index}
              renderItem={({ item }) => (
                <View>
                  <Text>Recorded at time: {item.recordedAtTime}</Text>
                  <Text>LineRef: {item.monitoredVehicleJourney.lineRef}</Text>
                  <Text>DirectionRef: {item.monitoredVehicleJourney.directionRef}</Text>
                  <Text>VehicleLocation: lat {item.monitoredVehicleJourney.vehicleLocation.latitude}, lon {item.monitoredVehicleJourney.vehicleLocation.longitude}</Text>
                  <Text>Bearing: {item.monitoredVehicleJourney.bearing}</Text>
                  <Text>Delay (relative time): {item.monitoredVehicleJourney.delay}</Text>
                  <Text>Origin stop id: {item.monitoredVehicleJourney.originShortName}</Text>
                  <Text>Destination stop id: {item.monitoredVehicleJourney.destinationShortName}</Text>
                  <Text>Speed: {item.monitoredVehicleJourney.speed}</Text>
                  <Text>Origin departure time: {item.monitoredVehicleJourney.originAimedDepartureTime}</Text>
                  <Text>Next stop expected arrival time: {item.monitoredVehicleJourney.onwardCalls[0].expectedArrivalTime}</Text>
                  <Text>Next stop pointer ref: {item.monitoredVehicleJourney.onwardCalls[0].stopPointRef}</Text>
                  <Text>Next stop order: {item.monitoredVehicleJourney.onwardCalls[0].order}</Text>
                  <Text>-----------------</Text>
                </View>
              )}
            />
            <Text>End of list</Text>
          </View>
        }
      </SafeAreaView>
  )
}

const TestQuery = () => {
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
      <VehicleActivity />
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

const WalttiTest = () => {
  // testing how to get data from Waltti API GTFS realtime
  // Waltti Docs: https://dev.publictransport.tampere.fi/docs
  // code referenced: https://gtfs.org/documentation/realtime/language-bindings/nodejs/

  const credentials = btoa(Constants.expoConfig.extra.waltti_api_credentials)

  async function getTripUpdates() {
    const apiUrl = `https://data.waltti.fi/tampere/api/gtfsrealtime/v1.0/feed/tripupdate`
    try {
      const response = await fetch(apiUrl, {
        headers: new Headers({
          'Authorization': 'Basic ' +credentials,
        })
      });
      if (!response.ok) {
        const error = new Error(`${response.url}: ${response.status} ${response.statusText}`)
        error.response = response
        throw error;
      }

      const buffer = await response.arrayBuffer();
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(buffer)
      );
      feed.entity.forEach((entity) => {
        if (entity.tripUpdate) {
          console.log(entity.tripUpdate)
        }
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function getVehiclePositions() {
    const apiUrl = `https://data.waltti.fi/tampere/api/gtfsrealtime/v1.0/feed/vehicleposition`
    try {
      const response = await fetch(apiUrl, {
        headers: new Headers({
          'Authorization': 'Basic ' +credentials,
        })
      });
      if (!response.ok) {
        const error = new Error(`${response.url}: ${response.status} ${response.statusText}`)
        error.response = response
        throw error;
      }

      const buffer = await response.arrayBuffer();
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(buffer)
      );
      feed.entity.forEach((entity) => {
        if (entity.vehicle) {
          console.log(entity.vehicle)
          /* if (entity.vehicle.vehicle.label === "Rahola") {
            console.log("SPECIFIC VEHICLE")
            console.log(entity.vehicle)
          } */
        }
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function getServiceAlerts() {
    const apiUrl = `https://data.waltti.fi/tampere/api/gtfsrealtime/v1.0/feed/servicealert`
    try {
      const response = await fetch(apiUrl, {
        headers: new Headers({
          'Authorization': 'Basic ' +credentials,
        })
      });
      if (!response.ok) {
        const error = new Error(`${response.url}: ${response.status} ${response.statusText}`)
        error.response = response
        throw error;
      }

      const buffer = await response.arrayBuffer();
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(buffer)
      );
      feed.entity.forEach((entity) => {
        if (entity.alert) {
          console.log(entity.alert)
        }
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  return (
    <View style={styles.container}>
      <Text>Data is printed to console</Text>
      <Button
        title="Get Trip Updates"
        onPress={() => getTripUpdates()}
      />
      <Button
        title="Get Vehicle Positions"
        onPress={() => getVehiclePositions()}
      />
      <Button
        title="Get Service Alerts"
        onPress={() => getServiceAlerts()}
      />
    </View>
  )
}

const Test = () => {
  return (
    <View style={styles.container}>
      {/* <VehicleActivity /> */}
      <WalttiTest />
    </View>
  )
}

export default Test;