import { gql } from '@apollo/client';

export const GET_TEST_ITINERARY = gql`
  {
    plan(
      from: {lat: 61.5025663, lon: 23.8038748}
      to: {lat: 61.4627341, lon: 23.8188355}
      numItineraries: 1
    ) {
      itineraries {
        legs {
          startTime
          endTime
          mode
          #from {
          #  lat
          #  lon
          #  name
          #  stop {
          #    code
          #    name
          #  }
          #},
          #to {
          #  lat
          #  lon
          #  name
          #},
          distance
          duration
          realTime
          transitLeg
        }
      }
    }
  }
`;

export const GET_ITINERARY = gql`
  {
    plan(
      from: {lat: 60.168992, lon: 24.932366}
      to: {lat: 60.175294, lon: 24.684855}
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
`

export const GET_CUSTOM_ITINERARY_QUERY = gql`
  query getCustomItinerary(
    $from: InputCoordinates!
    $to: InputCoordinates!
  ) {
    plan(
      from: $from
      to: $to
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
`