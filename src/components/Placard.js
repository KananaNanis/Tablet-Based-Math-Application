import React from 'react'
import { StyleSheet, View, Text } from 'react-native'

const Placard = ({ position, width, height, view_style, label, label_style }) => {
  label = 'yay!'
  position = position || [0, 0]
  width = width || 510
  height = height || 400
  return (
    <View style={[styles.placard, {
      left: position[0],
      bottom: position[1],
      width,
      height
    }, view_style]} >
      <Text style={[styles.text, label_style]} >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  placard: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '30%',
    borderWidth: 20,
    borderColor: 'blue',
  },
  text: {
    color: 'black',
    fontSize: 50,
  }
})

export default Placard