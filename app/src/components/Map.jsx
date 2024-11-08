import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
const polyline = require('@mapbox/polyline');

const Map = ({ vehicleLocation, journeyGeometry, stopCoordinates }) => {
  const [region, setRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const mapRef = useRef(null); // Create a ref for the MapView
  const [coords, setCoords] = useState([]); // array of Array<LatLng> for polylines for the map
  //console.log("VEHICLE LOCATION", vehicleLocation)

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
    // decode journeyGeometry into [latitude: Number, longitude: Number, ...]

    // save each decoded string from array into points array
    if (journeyGeometry) {
      let points = []
      for (i = 0; i < journeyGeometry.length; i++) {
        points.push(polyline.decode(journeyGeometry[i]))
      }
      // make sure type is Array<LatLng>
      let arrayOfCoordinates = []
      for (i = 0; i < points.length; i++) {
        arrayOfCoordinates.push(points[i].map((point) => {
          return {
            latitude: point[0],
            longitude: point[1]
          }
        }))
      }
      // result is an Array of Array<LatLng>: [[Array<LatLng>], [Array<LatLng>], ...]
      setCoords(arrayOfCoordinates)
    }
  }, [journeyGeometry])

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
          {vehicleLocation && // for multiple markers
            vehicleLocation.map((v, index) => (
              <Marker
                key={index}
                pinColor={'blue'}
                coordinate={{
                  latitude: v.latitude ? parseFloat(v.latitude) : 0,
                  longitude: v.longitude ? parseFloat(v.longitude): 0,
                }}
                title="Vehicle Location"
              />
            ))
          }
          {coords.length > 0 &&
            // draw a polyline for each separate leg for the journey
            coords.map((c, index) => (
              <Polyline
                key={index}
                coordinates={c}
                strokeColor={"#000"}
                strokeWidth={3}
              />
            ))
          }
          {stopCoordinates && stopCoordinates.length > 0 &&
            // draw a circle for each stop
            stopCoordinates.map((s, index) => (
              <Circle
                key={index}
                center={s}
                radius={10}
                strokeWidth={5}
                strokeColor={'red'}
                fillColor={'rgba(255,0,0,0.7)'}
              />
            ))
          }
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