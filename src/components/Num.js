import React from 'react'
import { StyleSheet, View } from 'react-native'
import Tower from './Tower'
import TowerName from './TowerName'

export const global_size2color = {
  '-3': 'limegreen', '-2': 'purple', '-1': 'darkgreen',
  '0': 'blue', '1': 'pink', '2': 'orange', '3': 'cyan'
}
export const global_size2symbol = {
  '-3': '-', '-2': '^', '-1': '\u25CF', '0': '\u2577', // '|',
  '1': '\u25AF', '2': '\u25EB', '3': '\u25E7'
}
export const global_size2fontsize = {
  '-3': 25, '-2': 30, '-1': 35, '0': 40,
  '1': 45, '2': 50, '3': 55
}
export const global_size2depth = {
  '-3': .1, '-2': .2, '-1': .8, '0': 1,
  '1': 8, '2': 50, '3': 500
}
export const global_size2padding = {
  '-3': 60, '-2': 50, '-1': 40, '0': 30,
  '1': 20, '2': 10, '3': 0
}
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

const Num = ({ id, name, position, tower_style, block_opacity, scale_factor }) => (
  <View style={[styles.num,
  { left: position[0], bottom: position[1] }
  ]}>
    <Tower id={id} name={name} position={position} style={tower_style} block_opacity={block_opacity} scale_factor={scale_factor} />
    <TowerName id={id} name={name} position={position} />
  </View>
)

const styles = StyleSheet.create({
  num: {
    position: 'absolute',
  }
})

export default Num