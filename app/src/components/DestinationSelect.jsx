import Constants from 'expo-constants';
import { Text, StyleSheet, View, FlatList, SafeAreaView, TextInput, Pressable } from 'react-native';
import { useFormik } from 'formik';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ITINERARY } from '../graphql/queries';
import { GET_CUSTOM_ITINERARY } from '../graphql/mutations';
import { useState } from 'react';

const styles = StyleSheet.create({
  flexContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  flexItemInput: {
    flexGrow: 0,
    backgroundColor: 'lightgreen'
  },
  flexItemResult: {
    flexGrow: 0,
    backgroundColor: 'lightblue'
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10
  }
});

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

const initialValues = {
  origin: '',
  destination: ''
}

const LocationForm = ({ onSubmit }) => {
  const formik = useFormik({
    initialValues,
    onSubmit
  });

  return (
    <SafeAreaView>
      <View style={styles.flexItemInput}>
        <TextInput
          style={styles.input}
          onChangeText={formik.handleChange('origin')}
          value={formik.values.origin}
          placeholder="Enter origin"
        />
        <TextInput
          style={styles.input}
          onChangeText={formik.handleChange('destination')}
          value={formik.values.destination}
          placeholder="Enter destination"
        />
        <Pressable onPress={formik.handleSubmit}>
          <Text>Get itineraries</Text>
        </Pressable>
      </View>

    </SafeAreaView>
  )
}

// use Geocoding API to search for addresses and coordinates
const getCoordinates = async (values) => {
  const url = (
    'https://api.digitransit.fi/geocoding/v1/search?' +
    new URLSearchParams({ text: values })
  );

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

  return res
}

const DestinationSelect = () => {
  //const [originCoordinates, setOriginCoordinates] = useState([])
  //const [destinationCoordinates, setDestinationCoordinates] = useState([])

  const [getCustomItinerary, { data, loading, error }] = useMutation(GET_CUSTOM_ITINERARY)

  const onSubmit = async (values) => {
    const fetchedOriginCoordinates = await getCoordinates(values.origin)
    const fetchedDestinationCoordinates = await getCoordinates(values.destination)

    //setOriginCoordinates(fetchedOriginCoordinates)
    //setDestinationCoordinates(fetchedDestinationCoordinates)

    getCustomItinerary({
      variables: {
        from: {lat: fetchedOriginCoordinates[1], lon: fetchedOriginCoordinates[0]},
        to: {lat: fetchedDestinationCoordinates[1], lon: fetchedDestinationCoordinates[0]}
      }
    })
  }

  //const { data, error, loading } = useQuery(GET_ITINERARY);

  if (loading) {
    return <Text>Loading...</Text>
  }
  if (error) {
    return <Text>Error! ${error.message}</Text>
  }
  //console.log(data.plan.itineraries[0].legs[0])

  return (
    <View style={styles.flexContainer}>
      <LocationForm onSubmit={onSubmit}/>
      <Text>Data returned</Text>
      <Text>${data}</Text>
      {/* <FlatList
        style={styles.flexItemResult}
        data={data.plan.itineraries[0].legs}
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item }) => (
          <View>
            <Text>Start time: {item.startTime}</Text>
            <Text>End time: {item.endTime}</Text>
            <Text>Mode: {item.mode}</Text>
            <Text>Distance: {item.distance}</Text>
            <Text>Duration: {item.duration}</Text>
          </View>
        )}
      /> */}
    </View>
  );
}

export default DestinationSelect;