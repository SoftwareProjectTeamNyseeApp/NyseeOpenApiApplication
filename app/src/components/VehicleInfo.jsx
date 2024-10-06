import React, { useState } from 'react';
import { Text, View, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { useLazyQuery } from '@apollo/client';
import { GET_VEHICLE_INFO } from '../graphql/queries';

const VehicleInfo = () => {
  const [vehicleId, setVehicleId] = useState('');
  const [fetchVehicleInfo, { data, loading, error }] = useLazyQuery(GET_VEHICLE_INFO);

  const handleFetch = () => {
    fetchVehicleInfo({ variables: { id: vehicleId } });
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter vehicle ID"
        value={vehicleId}
        onChangeText={setVehicleId}
      />
      <Button title="Get Vehicle Info" onPress={handleFetch} />
      {data && (
        <FlatList
          data={data.vehicle.routes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <Text>Route ID: {item.id}</Text>
              <Text>Route Name: {item.name}</Text>
              <Text>Timetable: {item.timetable}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
});

export default VehicleInfo;