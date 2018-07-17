import React from 'react'
import { View, Image, StyleSheet, Dimensions } from 'react-native'
import Num from './Num'
import Keypad from './Keypad'
import Button from './Button'
import Tile from './Tile'
import Placard from './Placard'

export const global_screen_width = Dimensions.get('window').width
export const global_screen_height = Dimensions.get('window').height
export const global_grass_height = 100
export const global_workspace_height = global_screen_height - global_grass_height

export const window2workspaceCoords = (pos0) =>
  [pos0[0], global_workspace_height - pos0[1]]

export const special_button_names = ['submit', 'restart', 'delete', 'next']
export const special_button_geoms = {
  'submit': [5, 400, 210, 70],
  'restart': [5, 330, 210, 70],
  'delete': [5, 330, 210, 70],
  'next': [180, 130, 210, 70],
}

const Workspace = ({ scale_factor, keypad_kind, button_display,
  button_highlight, freeze_display, num_stars, config_path,
  all_nums, all_tiles, all_lifts }) => {

  //console.log('Workspace all_nums', all_nums, 'all_tiles', all_tiles)
  let nums = []
  for (const id in all_nums) {
    const num = all_nums[id]
    nums.push(
      <Num id={id}
        name={num.name}
        position={num.position}
        tower_style={num.tower_style}
        block_opacity={num.block_opacity}
        scale_factor={scale_factor}
        key={id} />
    )
  }
  let tiles = []
  for (const id in all_tiles) {
    const tile = all_tiles[id]
    tiles.push(
      <Tile
        name={tile.name}
        position={tile.position}
        scale_factor={scale_factor}
        key={id} />
    )
  }
  /*
  let lifts = []
  for (const id in all_lifts) {
    const lift = all_lifts[id]
    lifts.push(
      <Lift
        name={lift.name}
        position={lift.position}
        scale_factor={scale_factor}
        key={id} />
    )
  }
  */
  let misc = [], key = 0
  if (keypad_kind) {
    //console.log('keypad_kind', keypad_kind)
    ++key
    misc.push(<Keypad
      kind={keypad_kind}
      button_display={button_display}
      button_highlight={button_highlight}
      freeze_display={freeze_display}
      key={key} />)
  }
  const button_view = {
    'submit': { borderColor: 'lime' },
  }
  const highlight_style = {
    backgroundColor: 'lightgreen'
  }
  for (const special_button of special_button_names) {
    if (special_button in button_display) {
      ++key
      misc.push(
        <Button
          position={special_button_geoms[special_button]}
          width={special_button_geoms[special_button][2]}
          height={special_button_geoms[special_button][3]}
          view_style={[
            styles.button_view_default,
            button_view[special_button],
            (special_button === button_highlight) ? highlight_style : {}
          ]}
          label={special_button}
          label_style={styles.button_text_default}
          key={key}
        />
      )
    }
  }
  for (const i = 0; i < num_stars; ++i) {
    ++key
    misc.push(
      <Image
        style={{ position: 'absolute', right: 5 + 25 * i, top: 5, width: 20, height: 20 }}
        source={require('../assets/img/star.png')}
        key={key}
      />
    )
  }
  if ('in_between' == config_path[0]) {
    ++key
    misc.push(
      <Placard
        position={[10, 100]}
        key={key}
      />
    )
  }
  return <View style={styles.workspace}>{nums}{tiles}{misc}</View>
  /*
  return <View style={styles.workspace}>
     <Tile position={[0,0]} width={200} height={200} name="kitty" />
  </View>
  */
}

const styles = StyleSheet.create({
  workspace: {
    //backgroundColor: 'blue',
    height: global_workspace_height,
    width: global_screen_width,
    position: 'absolute',
    left: 0,
    bottom: global_grass_height,
  },
  button_view_default: {
    backgroundColor: 'green',
    borderWidth: 10,
    borderColor: 'blue',
    borderRadius: 20,
  },
  button_text_default: {
    fontSize: 40,
    color: 'white',
    marginBottom: 10,
  }
})

export default Workspace