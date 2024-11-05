import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const Map = ({ vehicleLocation }) => {
  const [region, setRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const mapRef = useRef(null); // Create a ref for the MapView

  console.log("VEHICLE LOCATION", vehicleLocation)

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  useEffect(() => {
    if (vehicleLocation && mapRef.current) {
      // Focus the map on the vehicle location
      mapRef.current.animateToRegion({
        latitude: vehicleLocation.latitude,
        longitude: vehicleLocation.longitude,
        latitudeDelta: 0.005, // Adjust the zoom level as needed
        longitudeDelta: 0.005,
      }, 1000); // Animation duration in milliseconds
    }
  }, [vehicleLocation]);

  if (errorMsg) {
    return <Text>{errorMsg}</Text>;
  }

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          ref={mapRef} // Attach the ref to the MapView
          style={styles.map}
          region={region}
        >
          <Marker coordinate={region} title="You are here" />
          {vehicleLocation && (
            <Marker
              coordinate={{
                latitude: vehicleLocation.latitude ? parseFloat(vehicleLocation.latitude) : 0,
                longitude: vehicleLocation.longitude ? parseFloat(vehicleLocation.longitude): 0,
              }}
              title="Vehicle Location"
            />
          )}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default Map;