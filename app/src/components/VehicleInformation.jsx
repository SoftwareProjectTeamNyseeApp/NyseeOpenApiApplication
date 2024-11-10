import React, { useState } from 'react';
import { Text, View, Pressable, TextInput, SafeAreaView, StyleSheet, Modal, Button, ScrollView } from 'react-native';
import Map from './Map'; // Import the Map component

const formatTime = (dateTimeString) => {
  if (!dateTimeString) return "N/A"; // Handle cases where time might be undefined
  const timePart = dateTimeString.split('T')[1]; // Split by 'T' and take the time part
  return timePart.split('Z')[0]; // Remove the 'Z' at the end
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

const VehicleActivity = ({ setVehicleLocation, setStopsData }) => {
  const baseUrl = "https://data.itsfactory.fi/journeys/api/1";
  const [text, onChangeText] = useState('');

  const getVehicleActivity = async (line) => {
    const apiUrl = `${baseUrl}/vehicle-activity?lineRef=${line}`;
    try {
      const response = await fetch(apiUrl);
      const json = await response.json();
      if (json.body.length > 0) {
      /*const vehicleData = json.body[0].monitoredVehicleJourney;
        setVehicleLocation({
          latitude: vehicleData.vehicleLocation.latitude,
          longitude: vehicleData.vehicleLocation.longitude,
          details: vehicleData, // Store vehicle details
        }); */
        // for displaying multiple vehicles in VehicleInfoView
        const vehicleData = json.body.map(b => {
          return({
            latitude: b.monitoredVehicleJourney.vehicleLocation.latitude,
            longitude: b.monitoredVehicleJourney.vehicleLocation.longitude,
            details: b.monitoredVehicleJourney
          })
        })

        setVehicleLocation(vehicleData)

        // Check if onwardsCalls exists and is an array
        if (Array.isArray(vehicleData[0].details.onwardCalls)) {
          const busInfo = vehicleData[0].details.onwardCalls;

          // Fetch stop names for each stopPointRef
          const stopsData = await Promise.all(busInfo.map(async (call) => {
            const stopName = await getStopPointName(call.stopPointRef);
            return {
              stopName, // Use the fetched stop name
              expectedArrivalTime: formatTime(call.expectedArrivalTime),
              expectedDepartureTime: formatTime(call.expectedDepartureTime)
            };
          }));
          setStopsData(stopsData); // Store stops data with names
        } else {
          setStopsData([]); // Set to empty array if onwardsCalls is not available
        }
      }
    } catch (error) {
      console.error("Error fetching vehicle activity:", error);
    }
  };

  return (
    <SafeAreaView style={styles.activityContainer}>
      <Text style={styles.label}>Input your wanted public transport line:</Text>
      <View>
        <TextInput
          onChangeText={onChangeText}
          value={text}
          placeholder="line number, example 2"
          style={styles.input}
        />
        <Pressable style={styles.getButton} onPress={() => getVehicleActivity(text)}>
          <Text style={styles.buttonText}>Get</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const VehicleInformation = () => {
  const [vehicleLocation, setVehicleLocation] = useState([]);
  const [stopsData, setStopsData] = useState([]); // New state for stops data
  const [isMenuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible);
  };

  return (
    <View style={{ flex: 1 }}>
      <VehicleActivity setVehicleLocation={setVehicleLocation} setStopsData={setStopsData} />
      <Map vehicleLocation={vehicleLocation} />

      {/* Button to toggle the menu */}
      <Pressable style={styles.menuButton} onPress={toggleMenu}>
        <Text style={styles.buttonText}>Details</Text>
      </Pressable>

      {/* Menu Modal */}
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
              {stopsData.map((stop, index) => (
                <View key={index} style={styles.stopItem}>
                  <Text>Stop Name: {stop.stopName}</Text>
                  <Text>Expected Arrival: {stop.expectedArrivalTime}</Text>
                  <Text>Expected Departure: {stop.expectedDepartureTime}</Text>
                </View>
              ))}
            </ScrollView>
            <Button title="Close" onPress={toggleMenu} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  activityContainer: {
    backgroundColor: '#6495ed',
    padding: 20,
  },
  label: {
    alignItems: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 25,
    marginBottom: 10,
    borderWidth: 1,
    padding: 5,
    fontSize: 18,
    backgroundColor: '#fff'
  },
  getButton: {
    backgroundColor: '#536493',
    padding: 5,
    borderRadius: 3,
    alignItems: 'center',
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

export default VehicleInformation;
