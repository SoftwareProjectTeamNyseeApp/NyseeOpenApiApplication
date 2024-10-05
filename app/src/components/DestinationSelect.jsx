import Constants from 'expo-constants';
import { Text, StyleSheet, View, FlatList, SafeAreaView, TextInput, Pressable } from 'react-native';
import { useFormik } from 'formik';
import { useQuery, useMutation, gql, useLazyQuery } from '@apollo/client';
import { GET_ITINERARY } from '../graphql/queries';
import { GET_CUSTOM_ITINERARY } from '../graphql/mutations';
import { GET_CUSTOM_ITINERARY_QUERY } from '../graphql/queries';
import { useEffect, useState } from 'react';

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


const DestinationSelect = () => {
  // useLazyQuery to perform query later, not instantly
  const [ getCustomItinerary, { data, loading, error }] = useLazyQuery(GET_CUSTOM_ITINERARY_QUERY)

  // when form is submitted, coordinates of addresses are fetched and query is performed
  const onSubmit = async (values) => {
    const fetchedOriginCoordinates = await getCoordinates(values.origin);
    const fetchedDestinationCoordinates = await getCoordinates(values.destination);
    // place fetched coordinates into variables and do the query
    getCustomItinerary({
      variables: {
        from: { lat: fetchedOriginCoordinates[1], lon: fetchedOriginCoordinates[0] },
        to: { lat: fetchedDestinationCoordinates[1], lon: fetchedDestinationCoordinates[0] }
      }
    })
    //setOriginCoordinates(fetchedOriginCoordinates)
    //setDestinationCoordinates(fetchedDestinationCoordinates)
/*     try {
      //const response = await getCustomItinerary({
        variables: {
          numItineraries: 1
          //from: { lat: fetchedOriginCoordinates[1], lon: fetchedOriginCoordinates[0] },
          //to: { lat: fetchedDestinationCoordinates[1], lon: fetchedDestinationCoordinates[0] }
        }
      });
      console.log(response.data.getCustomItinerary);
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
  } */
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
    return (
      <View>
        <Text>Data received!</Text>
        <Text>Note: this is just 1 itinerary, need to iterate through data better and present in a nicer way</Text>
        <FlatList
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