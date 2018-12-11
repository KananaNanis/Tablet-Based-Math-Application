import React from 'react'
import {View, Text, StyleSheet, Dimensions} from 'react-native'

const {height, width} = Dimensions.get('window')

export class Yay extends React.Component {
  render() {
    return (
      <View
        style={styles.outerContainer}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.text}>Yay!</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  innerContainer: {

  },
  outerContainer: {
    borderColor: 'green',
    borderWidth: 25,
    borderRadius: 20,
    height: width/2,
    width: width/2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 50,
    textAlign: 'center',
  }
})
