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