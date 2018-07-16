import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import Button from './Button'
import { global_size2color, global_size2symbol, global_fiver_shadow } from './Num'

export function getButtonGeomsFor(kind) {
  //console.warn('getButtonGeomsFor', kind)
  const pos = getPositionInfoForKeypad(kind)
  let geoms = []
  for (const row = 0; row < pos.num_rows; ++row) {
    for (const col = 0; col < pos.num_cols; ++col) {
      geoms.push(
        [col * (pos.button_width + pos.space_width),
        row * (pos.button_height + pos.space_height),
        pos.button_width,
        pos.button_height,
        ]
      )
    }
  }
  return geoms
}

export function getPositionInfoForKeypad(kind) {
  let res = {
    position: [350, 50],
    button_width: 50, button_height: 50,
    space_width: 20, space_height: 30
  }
  if ("buildTower" == kind) {
    res['num_cols'] = 2
    res['num_rows'] = 5
  } else {  // default is decimal keypad
    res['num_cols'] = 3
    res['num_rows'] = 4
  }
  return res
}

export const buildTower_button_info = [
  [1, 0], [1, 1], [0, 0], [0, 1], [-1, 0], [-1, 1],
  [-2, 0], [-2, 1], [-3, 0], [-3, 1]
]

const Keypad = ({ kind, button_display, button_highlight,
  freeze_display }) => {
  let buttons = []
  const pos = getPositionInfoForKeypad(kind)
  const geoms = getButtonGeomsFor(kind)
  for (const row = 0; row < pos.num_rows; ++row) {
    for (const col = 0; col < pos.num_cols; ++col) {
      const index = col + pos.num_cols * row
      if (index in button_display && false === button_display[index])
        continue
      const button_position = [geoms[index][0], geoms[index][1]]
      const height = pos.button_height
      let label = index, label_style = {
        marginBottom: .15 * height,
        fontSize: .75 * height
      }  // default
      //console.log(label_style)
      if ("buildTower" == kind) {
        const size = buildTower_button_info[index][0]
        const is_fiver = buildTower_button_info[index][1]
        label = global_size2symbol[size]
        label_style['color'] = global_size2color[size]
        if (is_fiver) {
          label = '5' + label
          label_style = { ...global_fiver_shadow[1], ...label_style }
        }
      }
      const view_style = { backgroundColor: 'grey' }
      if (null !== button_highlight && index === button_highlight)
        view_style['backgroundColor'] = freeze_display ? 'red' : 'yellow'
      else if (freeze_display)
        view_style['opacity'] = 0.25
      buttons.push(
        <Button position={button_position}
          width={pos.button_width} height={height}
          view_style={view_style}
          label={label} label_style={label_style} key={index} />
      )
    }
  }
  let extras = []
  if ("buildTower" == kind) {
    extras.push(<Text style={{
      position: 'absolute',
      left: -120, bottom: 160, fontSize: 50
    }} key='707'>Small</Text>)
    extras.push(<Text style={{
      position: 'absolute',
      left: -120, bottom: 80, fontSize: 50
    }} key='727'>Box</Text>)
  }
  return (
    <View style={[styles.keypad,
    { left: pos.position[0], bottom: pos.position[1] }]} >
      {buttons}
      {extras}
    </View>
  )
}

const styles = StyleSheet.create({
  keypad: {
    position: 'absolute',
  },
})

export default Keypad