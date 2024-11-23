import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
const polyline = require('@mapbox/polyline');
import { useSelectedItinerary } from '../contexts/SelectedItineraryContext';

const Map = () => {
  const {
    vehicleInformation,
    journeyGeometry,
    stopCoordinates,
    legModes
  } = useSelectedItinerary();

  const [region, setRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const mapRef = useRef(null); // Create a ref for the MapView
  const [coords, setCoords] = useState([]); // array of Array<LatLng> for polylines for the map
  const [polylineStyles, setPolylineStyles] = useState([]);

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

  // decode journeyGeometry into [latitude: Number, longitude: Number, ...]
  useEffect(() => {
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

  // change polyline style in map depending on leg mode
  useEffect(() => {
    if (legModes) {
      let styles = []
      for (i = 0; i < legModes.length; i++) {
        if (legModes[i] === "WALK") {
          styles.push({
            color: 'rgba(0,0,0,0.8)',
            dashPattern: [5, 5]
          })
        }
        if (legModes[i] === "BUS") {
          styles.push({
            color: 'rgba(0,100,255,1)',
            dashPattern: null
          })
        }
        if (legModes[i] === "TRAM") {
          styles.push({
            color: 'rgba(255,0,0,1)',
            dashPattern: null
          })
        }
      }
      setPolylineStyles(styles)
    }
  }, [legModes])

  useEffect(() => {
    if (vehicleInformation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: vehicleInformation.latitude,
        longitude: vehicleInformation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  }, [vehicleInformation]);

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
          {vehicleInformation && // for multiple markers
            vehicleInformation.map((v, index) => (
              <Marker
                key={index}
                pinColor={'blue'}
                coordinate={{
                  latitude: v.latitude ? parseFloat(v.latitude) : 0,
                  longitude: v.longitude ? parseFloat(v.longitude): 0,
                }}
                title={v.line}
              >
                <View style={[styles.lineMarker, v.line === "1" || v.line === "3" ? styles.tramColor : styles.busColor]}>
                  <Text style={{fontWeight: "bold", color: "white", fontSize: 12}}>{v.line}</Text>
                </View>
              </Marker>
            ))
          }
          {coords.length > 0 &&
            // draw a polyline for each separate leg for the journey
            coords.map((c, index) => (
              <Polyline
                key={index}
                coordinates={c}
                strokeColor={polylineStyles[index].color}
                strokeWidth={4}
                lineDashPattern={polylineStyles[index].dashPattern}
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
                strokeColor={'rgba(60,60,60,0.8)'}
                fillColor={'rgba(201,0,201,0.5)'}
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
    backgroundColor: '#6495ed',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  lineMarker: {
    borderRadius: 12,
    height: 25,
    width: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  tramColor: {
    backgroundColor: 'rgba(255,0,0,1)'
  },
  busColor: {
    backgroundColor: 'rgba(0,100,255,1)'
  }
});

export default Map;