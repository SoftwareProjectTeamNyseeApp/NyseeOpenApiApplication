import Constants from 'expo-constants';
import { Text, StyleSheet, View, FlatList, SafeAreaView, TextInput, Pressable, TouchableOpacity, Button, Dimensions, Platform } from 'react-native';
import { Field, Formik } from 'formik';
import { useLazyQuery } from '@apollo/client';
import { GET_ITINERARY } from '../graphql/queries';
import { useItineraries } from '../contexts/ItineraryContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment/moment';
import React, { memo, useCallback, useRef, useState, useEffect, useMemo } from 'react'
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import * as Location from 'expo-location';

const styles = StyleSheet.create({
  flexContainer: {
    flex:1,
    backgroundColor: '#6495ed',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  flexItemInput: {
    flexGrow: 0,
    backgroundColor: 'lightgreen'
  },
  flexItemResult: {
    flexGrow: 0,
    backgroundColor: 'lightblue',
    height: 300,
    width: 300
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 300
  },
  getButton: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'lightblue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  pressable: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});

// TODO: add validation to form
/* const validate = (values) => {
  let errors = {};
  if (!values.origin) {
    errors.origin = "Origin is required";
  }
  if (!values.destination) {
    errors.destination = "Destination is required";
  }
  return errors;
} */


const LocationForm = ({ onSubmit }) => {
  return (
    <Formik
      initialValues={{
        origin: '',
        destination: '',
        date: moment(new Date()).format('YYYY-MM-DD'),
        time: moment(new Date()).format('HH:mm:ss')
      }}
      onSubmit={values => onSubmit(values)}
    >
      {({ handleChange, handleBlur, handleSubmit, values, setFieldValue }) => (
        <MyForm values={values} setFieldValue={setFieldValue} handleSubmit={handleSubmit} handleBlur={handleBlur} handleChange={handleChange} />
      )}
    </Formik>
  );
}

export const MyForm = (props) => {
  const { handleChange, handleBlur, handleSubmit, values, setFieldValue } = props;
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [mode, setMode] = useState('date')

  console.log("VALUES IN FORM", values)

  const showMode = (currentMode) => {
    setDatePickerVisibility(true)
    setMode(currentMode)
  }
  const showDatePicker = () => {
    showMode('date')
  };

  const showTimePicker = () => {
    showMode('time')
  }

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (dateTime) => {
    if(mode === 'date') {
      setFieldValue('date', moment(dateTime).format('YYYY-MM-DD'))
    }
    if(mode === 'time') {
      setFieldValue('time', moment(dateTime).format('HH:mm:ss'))
    }
    hideDatePicker();
  };

  const switchOriginAndDestination = () => {
    setFieldValue('origin', values.destination)
    setFieldValue('destination', values.origin)
    console.log("CHANGED DESTINATION", values.origin)
  }

  const handleSelectedItemForOrigin = (childData) => {
    setFieldValue('origin', childData)
  }

  const handleSelectedItemForDestination = (childData) => {
    setFieldValue('destination', childData)
  }

  return (
    <SafeAreaView>
      <View style={styles.flexItemInput}>
        <View>
          {/* <TextInput
            style={styles.input}
            onChangeText={handleChange('origin')}
            onBlur={handleBlur('origin')}
            value={values.origin}
            placeholder='Enter origin'
          /> */}
          <SuggestionDropDown
            sendDataToForm={handleSelectedItemForOrigin}
            value={values.origin}
            onBlur={handleBlur('origin')}
            placeholder='Enter origin'
          />
          {/* <TextInput
            style={styles.input}
            onChangeText={handleChange('destination')}
            onBlur={handleBlur('destination')}
            value={values.destination}
            placeholder='Enter destination'
          /> */}
          <SuggestionDropDown
            sendDataToForm={handleSelectedItemForDestination}
            value={values.destination}
            onBlur={handleBlur('destination')}
            placeholder='Enter destination'
          />
          <Pressable>
            <Text
              style={[styles.getButton, { width: 40, backgroundColor: "#fff", marginLeft: 15, textAlign: 'center' }]}
              onPress={() => switchOriginAndDestination()}
            >
              🔀
            </Text>
          </Pressable>
          <TouchableOpacity onPress={showDatePicker} style={styles.input}>
            <Text>{values.date || 'Enter date (YYYY-MM-DD)'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={showTimePicker} style={styles.input}>
            <Text>{values.time || 'Enter time (HH:mm:ss)'}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode={mode}
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />
          <Pressable onPress={handleSubmit}>
            <Text style={styles.getButton}>Get itineraries</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// WIP: connect with Formik
// use Geocoding Autocomplete API to get address suggestions for input fields
const getAutocompleteSuggestions = async (values) => {
  const url = (
    'http://api.digitransit.fi/geocoding/v1/autocomplete?' +
    new URLSearchParams({ text: values }) +
    // added bounding box to limit results around Tampere
    '&boundary.rect.min_lat=61.38&boundary.rect.max_lat=61.58&boundary.rect.min_lon=23.51&boundary.rect.max_lon=23.99'
  )
  console.log("URL", url)

  const res = await fetch(url, {
    headers: {
      'Cache-control': 'no-cache',
      'digitransit-subscription-key': Constants.expoConfig.extra.api_key
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('An error occurred');
    }
    return response.json();
  })
  .then(data => {
    const features = data.features
    // features.properties.layer: place type eg. "stop", "venue", "address", "street"
    // features.properties.postalcode
    // features.properties.confidence
    // features.properties.label: address <- for user
    // features.properties.region
    // -> could limit to Pirkanmaa only
    const suggestedAddresses = features.map(f => {
      return({
        id: f.properties.id,
        title: f.properties.label,
        coordinates: f.geometry.coordinates,
        layer: f.properties.layer, // street, address
      })
    })
    //console.log("suggested", suggestedAddresses)
    return suggestedAddresses
  })
  .catch(error => {
    console.error(error.message)
  })
  return res
}

// use Geocoding API to search for addresses and coordinates
// get coordinates for one place
// input address, eg. tamk and return lat and lon coordinates for it
const getCoordinates = async (values) => {
  const url = (
    'https://api.digitransit.fi/geocoding/v1/search?' +
    new URLSearchParams({ text: values })
  );

  // HTTP GET req for Geocaching API
  const res = await fetch(url, {
    headers: {
      'Cache-control': 'no-cache',
      'digitransit-subscription-key': Constants.expoConfig.extra.api_key
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('An error occurred');
    }
    return response.json();
  })
  .then(data => {
    //console.log(values, ':', data)
    let coordinates = data.features[0].geometry.coordinates // [lon, lat]
    console.log(`coordinates for ${values}`, coordinates)
    coordinates = coordinates.reverse() // make sure latitude is first
    return coordinates
  })
  .catch(error => {
    console.error(error.message)
  })

  // return coordinates [lat, lon]
  return res
}

export function getItineraryTimeAndDuration (itinerary) {
  const startTime = new Date(itinerary.startTime)
  const endTime = new Date(itinerary.endTime)
  const duration = (itinerary.duration / 60).toFixed()
  const selectedDate = moment(startTime).format('DD.MM.')

  return selectedDate + ' ' + moment(startTime).format('HH:mm') + '-' +
    moment(endTime).format('HH:mm') + ' (' + duration + ' min)'
}

function getLines (itinerary) {
  const legs = itinerary.legs
  let lineNumbers = []
  // if legs has a trip, save trip.routeShortName (line) to an array
  for (let i = 0; i < legs.length; i++) {
    if (legs[i].trip) {
      lineNumbers.push(legs[i].trip.routeShortName)
    }
  }
  if (lineNumbers.length === 1) {
    return "Line: " + lineNumbers[0]
  }
  else if (lineNumbers.length > 1) {
    return "Lines: " + lineNumbers.join(", ")
  }
  else {
    return "No lines found"
  }
}

// only works if app is active and this file is saved afterwards
// make user location context?
const getUserLocationAsSuggestion = () => {
  const [userCoordinates, setUserCoordinates] = useState(null);
  let location = ''

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      location = await Location.getCurrentPositionAsync({});
      setUserCoordinates({
        id: "userlocation",
        title: "Use My Location",
        coordinates: [location.coords.latitude, location.coords.longitude]
      });
    })();
  }, []);

  useEffect(() => {
    console.log("USER COORDS", userCoordinates)
  }, [userCoordinates])

  return userCoordinates
}

export const SuggestionDropDown = memo(({sendDataToForm, placeholder}) => {
  const userLocation = getUserLocationAsSuggestion()
  const [loading, setLoading] = useState(false)
  const [suggestionsList, setSuggestionsList] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const dropdownController = useRef(null)

  const searchRef = useRef(null)

  //console.log("SELECTED ITEM", selectedItem)

  // send the selected item or input to form
  const handleSelectedItem = (item) => {
    if (item) {
      sendDataToForm(item)
    }
  }

  const getSuggestions = useCallback(async q => {
    console.log("userlocation", userLocation)
    const filterToken = q.toLowerCase()
    console.log('getSuggestions', q)
    if (typeof q !== 'string' || q.length < 1) {
      setSuggestionsList(null)
      return
    }
    setLoading(true)
    const items = await getAutocompleteSuggestions(q)

    const suggestions = items
      .filter(item => item.title.toLowerCase().includes(filterToken))
      .map(item => ({
        id: item.id,
        title: item.title,
        coordinates: [item.coordinates[1], item.coordinates[0]]
    }))
    // add userLocation as an option if exists
    if (userLocation) {
      suggestions.unshift({
        id: userLocation.id,
        title: userLocation.title,
        coordinates: userLocation.coordinates
      })
    }
    //console.log("SUGGESTIONS", suggestions)
    setSuggestionsList(suggestions)
    setLoading(false)
    }, [])

    const onClearPress = useCallback(() => {
      setSuggestionsList(null)
    }, [])

    const onOpenSuggestionsList = useCallback(isOpened => {}, [])

    return (
      <>
        <View
          /* style={[
            { flex: 1, flexDirection: 'row', alignItems: 'center' },
            Platform.select({ ios: { zIndex: 1 } }),
          ]} */>
          <AutocompleteDropdown
            ref={searchRef}
            controller={controller => {
              dropdownController.current = controller
            }}
            direction={Platform.select({ ios: 'down' })}
            dataSet={suggestionsList}
            onChangeText={getSuggestions}
            onSelectItem={item => {
              item && setSelectedItem(item)
              handleSelectedItem(item)
            }}
            debounce={600}
            suggestionsListMaxHeight={Dimensions.get('window').height * 0.4}
            onClear={onClearPress}
            clearOnFocus={false}
            //closeOnSubmit={true}
            // if user presses submit on keyboard instead of choosing a suggestion, send typed input to form
            onSubmit={(e) => handleSelectedItem(e.nativeEvent.text)}
            onOpenSuggestionsList={onOpenSuggestionsList}
            loading={loading}
            useFilter={false} // set false to prevent rerender twice
            textInputProps={{
              placeholder: placeholder,
              autoCorrect: false,
              autoCapitalize: 'none',
              style: {
                borderRadius: 25,
                backgroundColor: '#fff',
                color: '#000',
                paddingLeft: 18,
              },
            }}
            rightButtonsContainerStyle={{
              right: 8,
              height: 30,
              alignSelf: 'center',
            }}
            inputContainerStyle={{
              backgroundColor: '#fff',
              borderRadius: 10,
            }}
            suggestionsListContainerStyle={{
              backgroundColor: '#fff',
            }}
            //containerStyle={{ flexGrow: 1, flexShrink: 1 }}
            renderItem={(item, text) => <Text style={{ color: '#000', padding: 15 }}>{item.title}</Text>}
            inputHeight={50}
            showChevron={true}
            closeOnBlur={false}
          />
          {/* <View style={{ width: 10 }} /> */}
          {/* <Button style={{ flexGrow: 0 }} title="Toggle" onPress={() => dropdownController.current.toggle()} /> */}
        </View>
      </>
    )
  }
)

const DestinationSelect = ({ navigation }) => {
  // useItineraries Context to save itineraries for the search query
  const { itineraries, setItineraries } = useItineraries();
  // useLazyQuery to perform query later, not instantly
  const [ getCustomItinerary, { data, loading, error }] = useLazyQuery(GET_ITINERARY)
  let fetchedItineraries;

  // when form is submitted, coordinates of addresses are fetched and query is performed
  const onSubmit = async (values) => {
    let fetchedOriginCoordinates = ''
    let fetchedDestinationCoordinates = ''

    // if the address is selected from suggestions, it already has coordinates resolved
    if (values.origin.coordinates) {
      fetchedOriginCoordinates = values.origin.coordinates;
    } else {
      fetchedOriginCoordinates = await getCoordinates(values.origin);
    }

    if (values.destination.coordinates) {
      fetchedDestinationCoordinates = values.destination.coordinates;
    } else {
      fetchedDestinationCoordinates = await getCoordinates(values.destination);
    }

    console.log("fetched origin", fetchedOriginCoordinates)
    console.log("fetched destination", fetchedDestinationCoordinates)

    // place fetched coordinates into variables and perform the query
    try {
      const response = await getCustomItinerary({
        variables: {
          from: { lat: fetchedOriginCoordinates[0], lon: fetchedOriginCoordinates[1] },
          to: { lat: fetchedDestinationCoordinates[0], lon: fetchedDestinationCoordinates[1] },
          date: values.date,
          time: values.time
        }
      });
      // add id to itineraries and save to context
      fetchedItineraries = response.data.plan.itineraries.map((item, index) => (
        { ...item, id: index + 1 }
      ))
      setItineraries(fetchedItineraries)
    } catch (error) {
      console.error("Error fetching itinerary:", error);
      if (error.graphQLErrors) {
        error.graphQLErrors.forEach(({ message }) => {
          console.error("GraphQL error:", message);
        });
      }
      if (error.networkError) {
        console.error("Network error:", error.networkError);
      }
    }
  }

  const Result = () => {
    if (loading) {
      return <Text>Loading...</Text>
    }
    if (error) {
      return <Text>Error: {error}</Text>
    }
    if (!data) {
      return null
    }
    if (data) {
      //console.log("itineraries in if data", itineraries)
    }
    return (
      <View>
        <Text>Data received!</Text>
        <FlatList
          style={styles.flexItemResult}
          data={itineraries}
          renderItem={({ item }) => (
            <View>
              <Text>------------</Text>
              <TouchableOpacity
                style={styles.pressable}
                onPress={() => navigation.navigate('ItineraryDetails', {
                  itineraryId: item.id
                })}
              >
                <Text>
                  Time: {getItineraryTimeAndDuration(item)}
                </Text>
                <Text>
                  From stop: {item.legs[1]?.from.name} { }
                  ({item.legs[0].distance.toFixed()} m away)
                </Text>
                {
                  <Text>
                    {getLines(item)}
                  </Text>
                }
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    )
  }

  return (
    <View style={styles.flexContainer}>
      <LocationForm onSubmit={onSubmit}/>
      <Result />
    </View>
  );
}

export default DestinationSelect;