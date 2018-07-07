import React from 'react'
import { StyleSheet, View, Text } from 'react-native'

const Button = ({ position, width, height, view_style, label, label_style }) => {
  return (
    <View style={[styles.button, {
      left: position[0],
      bottom: position[1],
      width,
      height
    }, view_style]} >
      <Text style={[{
        marginBottom: .15 * height,
        fontSize: .75 * height
      }, label_style]} >
        {label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '10%',
  },
})

export default Button