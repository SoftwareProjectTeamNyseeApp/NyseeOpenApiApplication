import { gql, useQuery } from '@apollo/client'
import { Text, View } from 'react-native';

const GET_CUSTOM_ITINERARY_DESTINATION_SELECT = gql`
  query getCustomItineraryInDestinationSelect($numItineraries: Int!) {
    plan(
      from: {lat: 60.168992, lon: 24.932366}
      to: {lat: 60.175294, lon: 24.684855}
      numItineraries: $numItineraries
    ) {
      itineraries {
        legs {
          startTime
          endTime
          mode
          duration
          realTime
          distance
          transitLeg
        }
      }
    }
  }
`

const TestQuery = () => {
  const numItineraries = 1
  const result = useQuery(GET_CUSTOM_ITINERARY_DESTINATION_SELECT, {
    variables: { numItineraries },
  })

  console.log(result)

  if (result.loading) {
    return <Text>loading...</Text>
  }

  console.log(result)

  return (
    <View>
      <Text>Loaded!</Text>
    </View>
  )
}

export default TestQuery