import React from 'react'
import { StyleSheet, View } from 'react-native'
import Tower from './Tower'
import TowerName from './TowerName'

export const global_fiver_shadow = [
  {},
  {
    textShadowColor: 'orange',
    textShadowOffset: { width: -3, height: 0 },
    textShadowRadius: 0
  },
  {
    textShadowColor: 'orange',
    textShadowOffset: { width: 3, height: 0 },
    textShadowRadius: 0
  },
]

const Num = ({ id, name, position, style, anim_info, tower_style, block_opacity, scale_factor }) => (
  <View style={[styles.num, style,
  { left: position[0], bottom: position[1] }
  ]}>
    <Tower id={id} name={name} position={position} style={tower_style} anim_info={anim_info} block_opacity={block_opacity} scale_factor={scale_factor} />
    <TowerName id={id} name={name} position={position} anim_info={anim_info} />
  </View>
)

const styles = StyleSheet.create({
  num: {
    position: 'absolute',
  }
})

export default Num