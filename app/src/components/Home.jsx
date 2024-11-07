import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Nysee App</Text>
      <View style={styles.navbar}>
        <Button
          style={styles.button}
          title="Find Destination"
          onPress={() => navigation.navigate('DestinationSelect')}
        />
        <Button
          style={styles.button}
          title="Vehicle Information"
          onPress={() => navigation.navigate('VehicleInfo')}
        />
        <Button
          style={styles.button}
          title="Map"
          onPress={() => navigation.navigate('Map')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginVertical: 20,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  button: {
    backgroundColor: '#000',
  },
});

export default Home;