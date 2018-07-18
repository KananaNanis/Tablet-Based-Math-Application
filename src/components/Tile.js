import React from 'react'
import { StyleSheet, View, Image } from 'react-native'
import { global_constant } from '../App'

const Tile = ({ name, position, style, extra_scale }) => {
  console.log('Tile name', name)
  extra_scale = extra_scale || 1.00
  const height = extra_scale * global_constant.screen_pixels_per_cm * 10
    * global_constant.animals[name].height
  const width = height * global_constant.animals[name].pixel_width /
    global_constant.animals[name].pixel_height
  //console.log('Tile name', name, 'position', position, 'width', width, 'height', height)
  let pos_info = { bottom: position[1] }
  pos_info.left = position[0]
  return (
    <View style={[styles.tile, style, pos_info,
    {
      width: width + 2,
      height: height + 2
    }]} >
      <Image
        style={{ position: 'absolute', width, height }}
        source={require('../assets/img/' + name + '.png')} />
    </View>
  )
}

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'orange',
  },
})

export default Tile