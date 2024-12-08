import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Nysee App</Text>
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate('DestinationSelect')}
        >
          <Text style={styles.text}>{"Find Destination"}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate('VehicleInfo')}
        >
          <Text style={styles.text}>{"Vehicle Information"}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.text}>{"Map"}</Text>
        </Pressable>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#6495ed'
  },
  buttonContainer: {
    paddingTop: 60,
  },
  title: {
    fontSize: 30,
    fontWeight: 800,
    lineHeight: 21,
    fontWeight: 'bold',
    paddingTop: 60,
    marginBot: 100
  },
  button: {
    backgroundColor: '#483d8b',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    elevation: 3,
    marginVertical: 10,
  },
  buttonPressed: {
    backgroundColor: '#372f70',
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});

export default Home;