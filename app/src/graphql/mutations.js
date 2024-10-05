import { gql } from '@apollo/client';

export const GET_CUSTOM_ITINERARY = gql`
  mutation GetCustomItinerary(
    #$from: InputCoordinates!
    #$to: InputCoordinates!
    $numItineraries: Int
  ) {
    #getCustomItinerary(numItineraries: $numItineraries) {
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
  #}
`