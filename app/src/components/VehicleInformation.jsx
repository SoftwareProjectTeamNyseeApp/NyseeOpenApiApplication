import React, { useState } from 'react';
import { Text, View, Pressable, TextInput, SafeAreaView, StyleSheet, Modal, Button, ScrollView } from 'react-native';
import Map from './Map'; // Import the Map component

const VehicleActivity = ({ setVehicleLocation }) => {
  const baseUrl = "https://data.itsfactory.fi/journeys/api/1";
  const [text, onChangeText] = useState('');

  const getVehicleActivity = async (line) => {
    const apiUrl = `${baseUrl}/vehicle-activity?lineRef=${line}`;
    try {
      const response = await fetch(apiUrl);
      const json = await response.json();
      if (json.body.length > 0) {
        const vehicleData = json.body[0].monitoredVehicleJourney;
        setVehicleLocation({
          latitude: vehicleData.vehicleLocation.latitude,
          longitude: vehicleData.vehicleLocation.longitude,
          details: vehicleData, // Store vehicle details
        });
      }
    } catch (error) {
      console.error("Error fetching vehicle activity:", error);
    }
  };

  return (
    <SafeAreaView style={styles.activityContainer}>
      <Text style={styles.label}>Vehicle line:</Text>
      <TextInput
        onChangeText={onChangeText}
        value={text}
        placeholder="line number, eg. 2"
        style={styles.input}
      />
      <Pressable style={styles.getButton} onPress={() => getVehicleActivity(text)}>
        <Text style={styles.buttonText}>Get</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const VehicleInformation = () => {
  const [vehicleLocation, setVehicleLocation] = useState(null);
  const [isMenuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible);
  };

  return (
    <View style={{ flex: 1 }}>
      <VehicleActivity setVehicleLocation={setVehicleLocation} />
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
              {vehicleLocation && vehicleLocation.details && (
                <Text>{JSON.stringify(vehicleLocation.details, null, 2)}</Text>
              )}
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
    padding: 20,
  },
  label: {
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    height: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    fontSize: 18,
  },
  getButton: {
    backgroundColor: 'blue',
    padding: 7,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
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
});

export default VehicleInformation;