import Constants from 'expo-constants';
import { Text, StyleSheet, View, FlatList, SafeAreaView, TextInput, Pressable, TouchableOpacity, Button } from 'react-native';
import { Formik } from 'formik';
import { useLazyQuery } from '@apollo/client';
import { GET_ITINERARY } from '../graphql/queries';
import { useItineraries } from '../contexts/ItineraryContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useState } from 'react';
import moment from 'moment/moment';

const styles = StyleSheet.create({
  flexContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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
  pressable: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  }
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

  return (
    <SafeAreaView>
      <View style={styles.flexItemInput}>
        <View>
          <TextInput
            style={styles.input}
            onChangeText={handleChange('origin')}
            onBlur={handleBlur('origin')}
            value={values.origin}
            placeholder='Enter origin'
          />
          <TextInput
            style={styles.input}
            onChangeText={handleChange('destination')}
            onBlur={handleBlur('destination')}
            value={values.destination}
            placeholder='Enter destination'
          />
          <TextInput
            style={styles.input}
            onPress={showDatePicker}
            placeholder='Enter date (YYYY-MM-DD)'
            value={values.date}
            onChangeText={handleChange('date')}
            onBlur={handleBlur('date')}
          />
          <TextInput
            style={styles.input}
            onPress={showTimePicker}
            placeholder='Enter time (HH:mm:ss)'
            value={values.time}
            onChangeText={handleChange('time')}
            onBlur={handleBlur('time')}
          />
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode={mode}
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />
          <Pressable onPress={handleSubmit}>
            <Text>Get itineraries</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
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
    console.log(values, ':', data)
    let coordinates = data.features[0].geometry.coordinates
    console.log(`coordinates for ${values}`, coordinates)
    return coordinates
  })
  .catch(error => {
    console.error(error.message)
  })

  // return coordinates [lat, lon]
  return res
}

export function getItineraryTimeAndDuration (itinerary) {
  const startTime = new Date(itinerary[0].startTime)
  const endTime = new Date(itinerary[itinerary.length - 1].endTime)
  const duration = ((endTime - startTime) / 60000).toFixed()
  const selectedDate = moment(startTime).format('DD.MM.')

  return selectedDate + ' ' + moment(startTime).format('HH:mm') + '-' +
    moment(endTime).format('HH:mm') + ' (' + duration + ' min)'
}

const DestinationSelect = ({ navigation }) => {
  // useItineraries Context to save itineraries for the search query
  const { itineraries, setItineraries } = useItineraries();
  // useLazyQuery to perform query later, not instantly
  const [ getCustomItinerary, { data, loading, error }] = useLazyQuery(GET_ITINERARY)
  let fetchedItineraries;

  // when form is submitted, coordinates of addresses are fetched and query is performed
  const onSubmit = async (values) => {
    const fetchedOriginCoordinates = await getCoordinates(values.origin);
    const fetchedDestinationCoordinates = await getCoordinates(values.destination);

    // place fetched coordinates into variables and perform the query
    try {
      const response = await getCustomItinerary({
        variables: {
          from: { lat: fetchedOriginCoordinates[1], lon: fetchedOriginCoordinates[0] },
          to: { lat: fetchedDestinationCoordinates[1], lon: fetchedDestinationCoordinates[0] },
          date: values.date,
          time: values.time
        }
      });
      console.log("Response for query:", response.data);
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
      console.log("itineraries in if data", itineraries)
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
                  Time: {getItineraryTimeAndDuration(item.legs)}
                </Text>
                <Text>
                  From stop: {item.legs[1].from.name} { }
                  ({item.legs[0].distance.toFixed()} m away)
                </Text>
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
      <Button
        title="Go to Vehicle info"
        onPress={() => navigation.navigate('VehicleInfo')}
      />
      <Button
        title="Go to Map"
        onPress={() => navigation.navigate('Map')}
      />
    </View>
  );
}

export default DestinationSelect;