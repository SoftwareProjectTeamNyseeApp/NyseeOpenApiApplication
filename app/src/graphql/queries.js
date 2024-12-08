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
`

export const GET_DEPRECATED_ITINERARY = gql`
  query getCustomItinerary(
    $from: InputCoordinates!
    $to: InputCoordinates!
    $date: String
    $time: String
  ) {
    plan(
      from: $from
      to: $to
      numItineraries: 5
      date: $date
      time: $time
    ) {
      itineraries {
        startTime
        endTime
        duration
        waitingTime
        walkDistance
        walkTime
        legs {
          startTime
          endTime
          mode
          from {
            lat
            lon
            name
            stopSequence
            stop {
              code
              name
              lat
              lon
            }
          },
          to {
            lat
            lon
            name
            stopSequence
            stop {
              code
              name
              lat
              lon
            }
          },
          duration
          realTime
          realtimeState
          distance
          transitLeg
          legGeometry {
            length
            points
          }
          trip {
            id
            gtfsId
            directionId
            routeShortName
            tripHeadsign
            tripGeometry {
              length
              points
            }
            alerts {
              id
              alertHeaderText
              alertDescriptionText
            }
            wheelchairAccessible
          }
          intermediatePlaces {
            name
            stopSequence
            arrivalTime
            departureTime
            stop {
              id
              name
              code
              lat
              lon
            }
          }
        }
      }
    }
  }
`

export const GET_ITINERARY = gql`
  query getCustomItinerary(
    $origin: PlanCoordinateInput!
    $destination: PlanCoordinateInput!
    $dateTime: OffsetDateTime
    $before: String
    $after: String
  ) {
	  planConnection(
      destination: { location: { coordinate: $destination } }
      origin: { location: { coordinate: $origin } }
      dateTime: { earliestDeparture: $dateTime }
      first: 5
      last: 5
      before: $before
      after: $after
    ) {
      pageInfo {
        startCursor
        endCursor
      }
      edges {
        node {
          start
          end
          duration
          waitingTime
          walkDistance
          walkTime
          legs {
            start { scheduledTime, estimated { time, delay } }
            end { scheduledTime, estimated { time, delay } }
            mode
            from {
              lat
              lon
              name
              stop {
                code
                name
                lat
                lon
              }
            },
            to {
              lat
              lon
              name
              stop {
                code
                name
                lat
                lon
              }
            },
            duration
            #realTime
            #realtimeState
            distance
            legGeometry {
              length
              points
            }
            trip {
              id
              gtfsId
              directionId
              routeShortName
              tripHeadsign
              #tripGeometry {
                #length
                #points
              #}
              #alerts {
                #id
                #alertHeaderText
                #alertDescriptionText
              #}
              wheelchairAccessible
              departureStoptime {
                #realtime
                #realtimeDeparture
                #departureDelay
                scheduledDeparture
                #stopPosition
                stop {
                  code
                  name
                }
                trip {
                  routeShortName
                  directionId
                }
              }
            }
            intermediatePlaces {
              name
              arrival { scheduledTime, estimated { time, delay } }
              departure { scheduledTime, estimated { time, delay } }
              stop {
                id
                name
                code
                lat
                lon
              }
            }
          }
        }
      }
    }
  }
`