import { createContext, useContext, useEffect, useState } from 'react';

export const SelectedItineraryContext = createContext();

export const SelectedItineraryProvider = ({children}) => {
  const [itinerary, setItinerary] = useState(null);
  const [lines, setLines] = useState([])
  const [directions, setDirections] = useState([])
  const [vehicleInformation, setVehicleInformation] = useState([])
  const [journeyGeometry, setJourneyGeometry] = useState([])
  const [stopCoordinates, setStopCoordinates] = useState([])
  const [legModes, setLegModes] = useState([])

  useEffect(() => {
    if (itinerary) {
      console.log("ITINERARY LEGS", itinerary.legs)
      const fetchedLines = getLines(itinerary.legs)
      const fetchedDirections = getDirections(itinerary.legs)
      const fetchedGeometry = getJourneyGeometry(itinerary.legs)
      const fetchedStopCoordinates = getStopCoordinates(itinerary.legs)
      const fetchedLegModes = getLegModes(itinerary.legs)
      setLines(fetchedLines);
      setDirections(fetchedDirections);
      setJourneyGeometry(fetchedGeometry);
      setStopCoordinates(fetchedStopCoordinates);
      setLegModes(fetchedLegModes);
    } else {
      setLines([]);
      setDirections([]);
      setJourneyGeometry([]);
      setStopCoordinates([]);
      setLegModes([]);
    }
  }, [itinerary])

  useEffect(() => {
    if (lines?.length > 0) {
      console.log("lines:", lines)
      const getCurrentVehicleInformation = async () => {
        const fetchedInformation = await getVehicleInformation({lines, directions})
        setVehicleInformation(fetchedInformation);
      }

      getCurrentVehicleInformation()
      // polling API every 2 seconds
      const interval = setInterval(getCurrentVehicleInformation, 2000);
      return () => {
        console.log("in return")
        clearInterval(interval)
        setVehicleInformation([])
      }
    } else {
      console.log("lines 0", lines)
    }
  }, [lines, directions])

  useEffect(() => {
    if(vehicleInformation.length > 0) {
      console.log("VEH INFO", vehicleInformation[0].line)
    }
  }, [vehicleInformation])

  function getLines (legs) {
    let lineNumbers = []
    // if legs has a trip, save trip.routeShortName (line) to an array
    for (let i = 0; i < legs.length; i++) {
      if (legs[i].trip) {
        lineNumbers.push(legs[i].trip.routeShortName)
      }
    }
    if (lineNumbers.length > 0) {
      return lineNumbers
    }
    else {
      return null
    }
  }

  function getDirections (legs) {
    // NOTE: graphQL directionId is 0, 1 or null
    // but in ITS API vehicle-activity directionRef is either 1 or 2
    let directions = []
    for (let i = 0; i < legs.length; i++) {
      if (legs[i].trip) {
        directions.push(parseInt(legs[i].trip.directionId) + 1)
      }
    }
    if (directions.length > 0) {
      return directions
    }
    else {
      return null
    }
  }

  function getJourneyGeometry (legs) {
    let legsGeometry = []
    // if legs has a legGeometry, save points into an array
    for (let i = 0; i < legs.length; i++) {
      if (legs[i].legGeometry) {
        legsGeometry.push(legs[i].legGeometry.points)
      }
    }
    if (legsGeometry.length > 0) {
      return legsGeometry
    }
    else {
      return null
    }
  }

  function getStopCoordinates (legs) {
    let stopCoordinates = []
    // if stop coordinates exist in from, to, or intermediatePlaces, push into array
    for (let i = 0; i < legs.length; i++) {
      if (legs[i].from.stop) {
        stopCoordinates.push({
          latitude: legs[i].from.stop.lat,
          longitude: legs[i].from.stop.lon
        })
      }
      if (legs[i].intermediatePlaces) {
        const intermediatePlacesFlat = legs[i].intermediatePlaces.map(i => {
          return({
            latitude: i.stop.lat,
            longitude: i.stop.lon
          })
        })
        stopCoordinates.push(intermediatePlacesFlat)
      }
      if (legs[i].to.stop) {
        stopCoordinates.push({
          latitude: legs[i].to.stop.lat,
          longitude: legs[i].to.stop.lon
        })
      }
    }
    return stopCoordinates.flat()
  }

  function getLegModes (legs) {
    let legModes = []
    for (let i = 0; i < legs.length; i++) {
      if (legs[i].mode) {
        legModes.push(legs[i].mode)
      }
    }
    if (legModes.length > 0) {
      return legModes
    }
    else {
      return null
    }
  }

  async function getVehicleInformation({lines, directions}) {
    const baseUrl = "https://data.itsfactory.fi/journeys/api/1";
    //const apiUrl = `${baseUrl}/vehicle-activity?lineRef=${lines[0]}&directionRef=${directions[0]}`
    // for multiple URLs
    let apiUrl = []
    for (let i = 0; i < directions.length; i++) {
      apiUrl.push(`${baseUrl}/vehicle-activity?lineRef=${lines[i]}&directionRef=${directions[i]}`)
    }
    console.log("URL", apiUrl)

    // fetch data from multiple URLs
    const fetchUrls = async (urls) => {
      try {
        const promises = urls.map(url => fetch(url));
        const responses = await Promise.all(promises);
        const data = await Promise.all(responses.map(response => response.json()));
        return data
      } catch (error) {
        throw new Error(`Failed to fetch data: ${error}`)
      }
    }

    const vehicleData = fetchUrls(apiUrl)
      .then(data => {
        const dataFlat = data.flatMap(d => d.body)

        if (dataFlat.length > 0) {
          const tempVehicleData = dataFlat.map((d) => {
            return({
              latitude: d.monitoredVehicleJourney.vehicleLocation.latitude,
              longitude: d.monitoredVehicleJourney.vehicleLocation.longitude,
              line: d.monitoredVehicleJourney.lineRef,
              details: d.monitoredVehicleJourney
            })
          })
          return tempVehicleData
        }
      })
      .catch(error => {
        console.error("Error fetching data:", error)
      });

    return vehicleData
  }

  return (
    <SelectedItineraryContext.Provider
      value={{
        itinerary,
        setItinerary,
        lines,
        directions,
        vehicleInformation,
        setVehicleInformation,
        journeyGeometry,
        stopCoordinates,
        legModes
      }}
    >
      {children}
    </SelectedItineraryContext.Provider>
  )
}

export const useSelectedItinerary = () => useContext(SelectedItineraryContext);