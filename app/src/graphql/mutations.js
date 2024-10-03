import { gql } from '@apollo/client';

export const GET_CUSTOM_ITINERARY = gql`
  mutation GetCustomItinerary(
    $from: InputCoordinates!
    $to: InputCoordinates!
  ) {
    getCustomItinerary(from: $from, to: $to) {
      plan(
        #from: {lat: 60.168992, lon: 24.932366}
        #to: {lat: 60.175294, lon: 24.684855}
        numItineraries: 3
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
  }
`