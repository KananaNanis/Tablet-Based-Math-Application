import React from 'react'
import { StyleSheet, View, Image } from 'react-native'

export const default_pixels_per_cm = 52

export const animals = {
  'ladybug': [.1, 297, 163],
  'mouse': [.2, 166, 122],
  'fish': [.3, 755, 493],
  'crab': [.4, 768, 440],
  'kitty': [.5, 269, 299],
  'puppy': [.6, 279, 280],
  'duck': [.7, 649, 456],
  'pig': [.8, 269, 205],
  'chimpanzee': [.85, 337, 464],
  'bear': [.9, 530, 689],
  'chick': [1.0, 231, 267],
  'sloth': [1.1, 453, 427],
  'deer': [1.2, 415, 450],
  'bull': [1.3, 359, 336],
  'unicorn': [1.4, 507, 633],
  'horse': [1.5, 507, 469],
  'moose': [1.6, 299, 278],
  'rhino': [1.7, 476, 430],
  'dragon': [1.8, 313, 523],
  'giraffe': [2.1, 413, 742],
}

const Tile = ({ name, position, extra_scale}) => {
  //console.log('Tile name', name)
  extra_scale = extra_scale || 1.0
  const height = extra_scale * default_pixels_per_cm * 10 * animals[name][0]
  const width = height * animals[name][1] / animals[name][2]
  //console.log('Tile name', name, 'position', position, 'width', width, 'height', height)
  let pos_info = { bottom: position[1] }
  if (position[0] > 0) pos_info.left = position[0]
  else pos_info.right = -1*position[0]
  return (
    <View style={[styles.tile, pos_info,
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