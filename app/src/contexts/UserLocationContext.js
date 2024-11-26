import { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';

export const UserLocationContext = createContext();

export const UserLocationProvider = ({children}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [userCoordinates, setUserCoordinates] = useState(null);

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      setUserCoordinates([location.coords.latitude, location.coords.longitude]);
    }

    getCurrentLocation();
  }, [])

  /* useEffect(() => {
    console.log("USER COORDS IN CONTEXT", userCoordinates)
  }, [userCoordinates])

  useEffect(() => {
    console.log("USER LOCATION IN CONTEXT", userLocation)
  }, [userLocation]) */

  return (
    <UserLocationContext.Provider
      value={{
        userLocation,
        setUserLocation,
        userCoordinates,
        setUserCoordinates
      }}
    >
      {children}
    </UserLocationContext.Provider>
  )
}

export const useUserLocation = () => useContext(UserLocationContext);