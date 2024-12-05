import { Text, StyleSheet, View, FlatList, SafeAreaView, Pressable, TouchableOpacity, Dimensions, Platform } from 'react-native';
import moment from 'moment/moment';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { clear, getAllItems, getAllKeys, getItem, removeItem } from '../utils/AsyncStorage';
import { useItineraries } from '../contexts/ItineraryContext';
import { useFocusEffect } from "@react-navigation/native";

export function getItineraryTimeAndDuration (itinerary) {
  const startTime = new Date(itinerary.start)
  const endTime = new Date(itinerary.end)
  const duration = (itinerary.duration / 60).toFixed()
  const selectedDate = moment(startTime).format('DD.MM.')

  return selectedDate + ' ' + moment(startTime).format('HH:mm') + '-' +
    moment(endTime).format('HH:mm') + ' (' + duration + ' min)'
}

function getLines (itinerary) {
  const legs = itinerary.legs
  let lineNumbers = []
  // if legs has a trip, save trip.routeShortName (line) to an array
  for (let i = 0; i < legs.length; i++) {
    if (legs[i].trip) {
      lineNumbers.push(legs[i].trip.routeShortName)
    }
  }
  if (lineNumbers.length === 1) {
    return "Line: " + lineNumbers[0]
  }
  else if (lineNumbers.length > 1) {
    return "Lines: " + lineNumbers.join(", ")
  }
  else {
    return "No lines found"
  }
}

const SavedItineraries = ({ navigation }) => {
  const [data, setData] = useState(null);
  const [keys, setKeys] = useState([]);
  const [dataAsArray, setDataAsArray] = useState([]);

  useEffect(() => {
    getSavedItineraries()
  }, [])

  useEffect(() => {
    //console.log("DATA", data)
    //console.log("KEYS", keys)
    if (data) {
      const array = Object.keys(data).map(function(key) {
        return { key: key, ...data[key]}
      })
      setDataAsArray(array)
    }
  }, [data])

  const { setItineraries } = useItineraries();

  useEffect(() => {
    setItineraries(dataAsArray)
  }, [dataAsArray])

  const getSavedItineraries = async () => {
    const savedItineraries = await getAllItems()
    const allKeys = await getAllKeys()
    setData(savedItineraries)
    setKeys(allKeys)
  }

  const removeItinerary = async (key) => {
    try {
      await removeItem(key)
      getSavedItineraries()
    } catch (error) {
      console.error('Error removing itinerary', error)
    }
  }

  const clearSavedItineraries = async () => {
    try {
      await clear()
      getSavedItineraries()
    } catch (error) {
      console.error('Error clearing itineraries', error)
    }
  }

  return (
    <View style={styles.flexContainer}>
      <View style={styles.resultsContainer}>
        <FlatList
          style={styles.flexItemResult}
          data={dataAsArray}
          renderItem={({ item }) => (
            <View>
              <TouchableOpacity
                style={styles.pressable}
                onPress={() => navigation.navigate('ItineraryDetails', {
                  itineraryId: item.id
                })}
              >
                <Text>
                  Time: {getItineraryTimeAndDuration(item)}
                </Text>
                <Text>
                  From stop: {item.legs[0]?.from.name !== 'Origin' ? (
                    item.legs[0]?.from.name
                    ) : (
                    item.legs[1]?.from.name
                    )} { }
                  ({item.legs[0].mode === "WALK" ? (
                    item.legs[0].distance.toFixed()
                  ) : (
                    0
                  )} m away)
                </Text>
                {
                  <Text>
                    {getLines(item)}
                  </Text>
                }
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removeItinerary(item.key)}
                style={styles.removeButton}
              >
                <Text>Remove itinerary</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
      <TouchableOpacity
        onPress={() => clearSavedItineraries()}
        style={styles.removeButton}
      >
        <Text>Remove all itineraries</Text>
      </TouchableOpacity>
    </View>

  )
}

const styles = StyleSheet.create({
  flexContainer: {
    flex:1,
    backgroundColor: '#6495ed',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  flexItemResult: {
    flexGrow: 0,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    margin: 4
  },
  removeButton: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#ce0000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    color: '#fff'
  },
  pressable: {
    backgroundColor: '#e2e2e2',
    borderRadius: 5,
    margin: 5,
    padding: 5
  },
  resultsContainer: {
    padding: 4,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    marginTop: 10,
    height: '90%',
    width: '90%',
    marginBottom: 10
  },
});


export default SavedItineraries;