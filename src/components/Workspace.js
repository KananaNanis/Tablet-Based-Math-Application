import React from 'react'
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native'
import Num from './Num'
import Keypad from './Keypad'
import Button from './Button'
import Tile from './Tile'
import Placard from './Placard'
import { global_constant, image_location } from '../App'

export const global_screen_width = Dimensions.get('window').width
export const global_screen_height = Dimensions.get('window').height
export const global_grass_height = 100
export const global_workspace_height = global_screen_height - global_grass_height

export const window2workspaceCoords = (pos0) =>
  [pos0[0], global_workspace_height - pos0[1]]

const Workspace = ({ scale_factor, keypad_kind, button_display,
  button_highlight, freeze_display, num_stars, config_path,
  all_nums, all_tiles, all_lifts, center_text }) => {

  console.log('Workspace all_nums', all_nums, 'all_tiles', all_tiles)
  //console.log('Workspace center_text', center_text)
  let nums = []
  for (const id in all_nums) {
    const num = all_nums[id]
    console.log('num id', id, 'anim_info', num.anim_info)
    nums.push(
      <Num id={id}
        name={num.name}
        position={num.position}
        style={num.style}
        anim_info={num.anim_info}
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
        style={tile.style}
        anim_info={tile.anim_info}
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
        style={lift.style}
        anim_info={lift.anim_info}
        scale_factor={scale_factor}
        key={id} />
    )
  }
  */
  let misc = [], key = 0
  if (1) { // add username
    ++key
    misc.push(<Text
      style={styles.username}
      key={key}>{global_constant.username}</Text>)
  }
  if (center_text) {
    ++key
    misc.push(<Text
      style={styles.center_text}
      key={key}>{center_text}</Text>)
  }
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
  if ('in_between' == config_path[0]) {
    ++key
    misc.push(
      <Placard
        position={global_constant.placard.position}
        width={global_constant.placard.width}
        height={global_constant.placard.height}
        key={key}
      />
    )
  }
  const button_view = {
    'submit': { borderColor: 'lime' },
  }
  const highlight_style = {
    backgroundColor: 'lightgreen'
  }
  const freeze_highlight_style = {
    backgroundColor: 'red'
  }
  const freeze_no_highlight_style = {
    backgroundColor: 'grey'
  }
  console.log('freeze_display', freeze_display)
  for (const special_button in global_constant.special_button_geoms) {
    if (special_button in button_display) {
      ++key
      let bg_style = {}
      if (freeze_display) {
        bg_style = (special_button === button_highlight) ?
          freeze_highlight_style : freeze_no_highlight_style
      } else if (special_button === button_highlight)
        bg_style = highlight_style
      console.log('bg_style', bg_style)
      misc.push(
        <Button
          position={global_constant.special_button_geoms[special_button].position}
          width={global_constant.special_button_geoms[special_button].width}
          height={global_constant.special_button_geoms[special_button].height}
          view_style={[
            styles.button_view_default,
            button_view[special_button],
            bg_style
            //(special_button === button_highlight) ? 
            //  (freeze_display ? freeze_highlight_style : highlight_style) : {}
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
        source={image_location('star')}
        key={key}
      />
    )
    //source={require('img/star.png')}
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
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  username: {
    position: 'absolute',
    fontSize: 20,
    top: 0,
    left: global_screen_width / 2
  },
  center_text: {
    fontSize: 30
  }
})

export default Workspace