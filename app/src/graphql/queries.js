import { gql } from '@apollo/client';

// Query for Trip Updates
export const GET_TRIP_UPDATES = gql`
  {
    tripUpdates {
      trip {
        trip_id
        route_id
        direction_id
        start_time
        start_date
        schedule_relationship
      }
      vehicle {
        id
        label
        trip_headsign
        license_plate
      }
      stop_time_update {
        stop_id
        arrival {
          delay
          time
        }
        departure {
          delay
          time
        }
        timestamp
      }
    }
  }
`;

// Query for Vehicle Positions
export const GET_VEHICLE_POSITIONS = gql`
  {
    vehiclePositions {
      trip {
        trip_id
        route_id
        direction_id
        start_time
        start_date
        schedule_relationship
      }
      vehicle {
        id
        label
        trip_headsign
        license_plate
      }
      position {
        latitude
        longitude
        bearing
        speed
        current_stop_sequence
        stop_id
        current_status
        timestamp
      }
      congestion_level
      occupancy_status
    }
  }
`;

// Query for Service Alerts
export const GET_SERVICE_ALERTS = gql`
  {
    serviceAlerts {
      active_period {
        start
        end
      }
      informed_entity {
        agency_id
        route_id
        route_type
        stop_id
      }
      cause
      effect
      url
      header_text
      description_text
      severity_level
    }
  }
`;