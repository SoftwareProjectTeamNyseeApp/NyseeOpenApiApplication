import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const Map = ({ vehicleLocation }) => {
  const [region, setRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const mapRef = useRef(null); // Create a ref for the MapView

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
      mapRef.current.animateToRegion({
        latitude: vehicleLocation.latitude,
        longitude: vehicleLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  }, [vehicleLocation]);

  if (errorMsg) {
    return <Text>{errorMsg}</Text>;
  }

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          showsBuildings={false}
          showsTraffic={true}
          showsCompass={true}
          showsMyLocationButton={true}
          showsIndoors={false}
        >
          <Marker coordinate={region} title="You are here" />
          {vehicleLocation && (
            <Marker
              coordinate={{
                latitude: parseFloat(vehicleLocation.latitude),
                longitude: parseFloat(vehicleLocation.longitude),
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
    backgroundColor: '#6495ed',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default Map;