import { Text, StyleSheet, View, FlatList, SafeAreaView, TextInput, Pressable } from 'react-native';
import { useFormik } from 'formik';
import { useQuery } from '@apollo/client';
import { GET_ITINERARY } from '../graphql/queries';

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

const DestinationSelect = () => {
  const onSubmit = values => {
    console.log("Your origin:", values.origin, "\nYour destination:", values.destination)
  }
  const { data, error, loading } = useQuery(GET_ITINERARY);

  if (loading) {
    return <Text>Loading...</Text>
  }
  if (error) {
    return <Text>Error! ${error.message}</Text>
  }
  console.log(data.plan.itineraries[0].legs[0])

  return (
    <View style={styles.flexContainer}>
      <LocationForm onSubmit={onSubmit}/>
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
  );
}

export default DestinationSelect;