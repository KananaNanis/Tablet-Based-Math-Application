import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import Button from './Button'
import { global_fiver_shadow } from './Num'
import { global_constant } from '../App'

export function get_button_geoms_for(kind) {
  //console.warn('get_button_geoms_for', kind)
  const pos = global_constant.keypad_info[kind]
  let geoms = []
  for (const row = 0; row < pos.num_rows; ++row) {
    for (const col = 0; col < pos.num_cols; ++col) {
      geoms.push(
        {
          position: [col * (pos.button_width + pos.space_width),
          row * (pos.button_height + pos.space_height)],
          width: pos.button_width,
          height: pos.button_height,
        }
      )
    }
  }
  return geoms
}

export function get_keypad_width_height(kind) {
  const pos = global_constant.keypad_info[kind]
  return {
    width: pos.num_cols * pos.button_width + (pos.num_cols - 1) * pos.space_width,
    height: pos.num_rows * pos.button_height + (pos.num_rows - 1) * pos.space_height
  }
}

const Keypad = ({ kind, button_display, button_highlight,
  freeze_display }) => {
  let buttons = []
  const pos = global_constant.keypad_info[kind]
  const geoms = get_button_geoms_for(kind)
  for (const row = 0; row < pos.num_rows; ++row) {
    for (const col = 0; col < pos.num_cols; ++col) {
      const index = col + pos.num_cols * row
      if (index in button_display && false === button_display[index])
        continue
      const button_position = geoms[index].position
      const height = pos.button_height
      let label = index, label_style = {
        marginBottom: .15 * height,
        fontSize: .75 * height
      }  // default
      //console.log(label_style)
      if ("buildTower" == kind) {
        const size = global_constant.buildTower_button_info[index][0]
        const is_fiver = global_constant.buildTower_button_info[index][1]
        label = global_constant.tower.size2symbol[size]
        label_style['color'] = global_constant.tower.size2color[size]
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