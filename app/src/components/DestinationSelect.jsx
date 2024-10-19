import Constants from 'expo-constants';
import { Text, StyleSheet, View, FlatList, SafeAreaView, TextInput, Pressable, TouchableOpacity } from 'react-native';
import { useFormik } from 'formik';
import { useLazyQuery } from '@apollo/client';
import { GET_ITINERARY } from '../graphql/queries';

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
        <TextInput
          style={styles.input}
          onChangeText={formik.handleChange('date')}
          value={formik.values.date}
          placeholder="Enter date: YYYY-MM-DD (optional)"
        />
        <TextInput
          style={styles.input}
          onChangeText={formik.handleChange('time')}
          value={formik.values.time}
          placeholder="Enter time: hh:mm:ss (optional)"
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

export function getItineraryTimeAndDuration (itinerary) {
  const startTime = new Date(itinerary[0].startTime)
  const endTime = new Date(itinerary[itinerary.length - 1].endTime)
  const duration = ((endTime - startTime) / 60000).toFixed()
  return startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + "-" +
    endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " (" +
    duration + " min)"
}

const DestinationSelect = ({ navigation }) => {
  // useLazyQuery to perform query later, not instantly
  const [ getCustomItinerary, { data, loading, error }] = useLazyQuery(GET_ITINERARY)
  let itineraries = ''

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

/*   function getItineraryTimeAndDuration (itinerary) {
    const startTime = new Date(itinerary[0].startTime)
    const endTime = new Date(itinerary[itinerary.length - 1].endTime)
    const duration = ((endTime - startTime) / 60000).toFixed()
    return startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + "-" +
      endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " (" +
      duration + " min)"
  } */

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
      /* itineraries = data.plan.itineraries.map(d =>
        d.legs
      ) */
     // add id to itineraries
      itineraries = data.plan.itineraries.map((item, index) => (
        { ...item, id: index + 1 }
      ))
      console.log("itinearies:", itineraries)
    }
    return (
      <View>
        <Text>Data received!</Text>
        <FlatList
          style={styles.flexItemResult}
          data={itineraries}
          //keyExtractor={(item, index) => String(index)}
          renderItem={({ item }) => (
            <View>
              <Text>------------</Text>
              <TouchableOpacity
                style={styles.pressable}
                onPress={() => navigation.navigate('ItineraryDetails', {
                  data: item.legs,
                  number: item.id
                  // NOTE: save current query eg. in global store
                  // don't send data with params
                  // can be used to send itinerary id, starttime or something
                  // for now just testing detailed screen with params
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
    </View>
  );
}

export default DestinationSelect;