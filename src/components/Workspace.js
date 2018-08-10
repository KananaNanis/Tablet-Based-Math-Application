import React from 'react'
import { View, Image, Text, Animated, StyleSheet, Dimensions } from 'react-native'
import { Map, toJS } from 'immutable'
import Num from './Num'
import Keypad from './Keypad'
import Button from './Button'
import Tile from './Tile'
import Placard from './Placard'
import Door from './Door'
import ErrBox from './ErrBox'
import CamelContainer from '../containers/CamelContainer'
import { global_constant, image_location } from '../App'
import { query_event_show_camel } from '../providers/query_store';

export const global_screen_width = Dimensions.get('window').width
export const global_screen_height = Dimensions.get('window').height
export const global_grass_height = 100
export const global_workspace_height = global_screen_height - global_grass_height

export const window2workspaceCoords = (pos0) =>
  [pos0[0], global_workspace_height - pos0[1]]

export function start_anim(anim_var, toValue, duration, delay = 0) {
  Animated.timing(anim_var,
    {
      toValue,
      duration,
      delay,
    }
  ).start();
}

export function add_offset(pos, offset_x=0) { return [pos.get(0) + offset_x, pos.get(1)] }

function my_get(obj, key) {
  const raw = obj.get(key)
  return raw ? raw.toJS() : raw
}

export function render_nums(all_nums, scale_factor, offset_x = 0, just_grey = false) {
  //console.log('render_nums just_grey', just_grey)
  //console.log('render_nums all_nums', all_nums)
  let nums = []
  if (!Map.isMap(all_nums)) return nums
  //for (const id in all_nums)
  all_nums.keySeq().forEach((id) => {
    //console.log('num id ', id)
    const num = all_nums.get(id)
    //console.log('num id ', id, 'anim_info', num.get('anim_info'))
    nums.push(
      <Num id={id}
        name={num.get('name').toJS()}
        position={add_offset(num.get('position'), offset_x)}
        style={my_get(num, 'style')}
        anim_info={my_get(num, 'anim_info')}
        misc={my_get(num, 'misc')}
        tower_style={my_get(num, 'tower_style')}
        block_opacity={my_get(num, 'block_opacity')}
        scale_factor={scale_factor}
        just_grey={just_grey}
        key={id} />
    )
  })
  return nums
}

export function render_tiles(all_tiles, scale_factor, offset_x = 0, just_grey = false) {
  let tiles = []
  if (!Map.isMap(all_tiles)) return tiles
  //console.log('render_tiles all_tiles ', all_tiles)
  //for (const id in all_tiles)
  all_tiles.keySeq().forEach((id) => {
    const tile = all_tiles.get(id)
    tiles.push(
      <Tile
        name={tile.get('name')}
        position={add_offset(tile.get('position'), offset_x)}
        style={my_get(tile, 'style')}
        anim_info={my_get(tile, 'anim_info')}
        misc={my_get(tile, 'misc')}
        scale_factor={scale_factor}
        just_grey={just_grey}
        key={id} />
    )
  })
  return tiles
}

export function render_doors(all_doors, skip, scale_factor, offset_x = 0, just_grey = false) {
  let doors = []
  if (!Map.isMap(all_doors)) return doors
  //console.log('render_doors all_doors ', all_doors.toJS())
  //for (const id in all_doors)
  all_doors.keySeq().forEach((id) => {
    if (id != skip) {
      const door = all_doors.get(id)
      doors.push(
        <Door
          name={door.get('name').toJS()}
          position={add_offset(door.get('position'), offset_x)}
          style={my_get(door, 'style')}
          anim_info={my_get(door, 'anim_info')}
          misc={my_get(door, 'misc')}
          scale_factor={scale_factor}
          just_grey={just_grey}
          id={id}
          key={id} />
      )
    }
  })
  return doors
}

export function render_portals(all_portals, skip, all_nums, all_tiles, all_doors, scale_factor, offset_x = 0, just_grey = false) {
  let portals = []
  if (!Map.isMap(all_portals)) return portals
  //for (const id in all_portals)
  all_portals.keySeq().forEach((id) => {
    if (id != skip) {
      const portal = all_portals.get(id)
      portals.push(
        <Door
          name={portal.get('name').toJS()}
          position={add_offset(portal.get('position'), offset_x)}
          style={my_get(portal, 'style')}
          anim_info={my_get(portal, 'anim_info')}
          misc={my_get(portal, 'misc')}
          scale_factor={scale_factor}
          all_nums={all_nums}
          all_tiles={all_tiles}
          all_doors={all_doors}
          all_portals={all_portals}
          just_grey={just_grey}
          id={id}
          key={id} />
      )
    }
  })
  return portals
}

const Workspace = ({ scale_factor, keypad_kind, button_display,
  button_highlight, freeze_display, num_stars, config_path,
  all_nums, all_tiles, all_doors, all_portals, center_text,
  top_right_text, err_box }) => {

  //console.log('Workspace all_nums', all_nums, 'all_tiles', all_tiles, 'all_doors', all_doors)
  //console.log('Workspace all_portals', all_portals)
  if ('undefined' === typeof config_path) return []
  //console.log('Workspace config_path', config_path.toJS())
  const nums = render_nums(all_nums, scale_factor)
  const tiles = render_tiles(all_tiles, scale_factor)
  const doors = render_doors(all_doors, skip = null, scale_factor)
  const portals = render_portals(all_portals, skip = null, all_nums, all_tiles, all_doors, scale_factor)
  let misc = [], key = 0
  if (1) { // add username
    ++key
    misc.push(<Text
      style={styles.username}
      key={key}>{global_constant.username}</Text>)
  }
  if (err_box) { // add camel container, for now!
    //console.log('err_box', err_box)
    ++key
    if (query_event('show_camel'))
      misc.push(<CamelContainer key={key} />)
    else if (err_box.has('position'))
      misc.push(<ErrBox position={err_box.get('position').toJS()}
        width={err_box.get('width')} height={err_box.get('height')} key={key} />)
  }
  if (center_text) {
    ++key
    misc.push(<Text
      style={styles.center_text}
      key={key}>{center_text}</Text>)
  }
  if (top_right_text) {
    ++key
    misc.push(<Text
      style={[styles.top_right_text,
        {right: global_constant.top_right_text_offset},
      ]}
      key={key}>{top_right_text}</Text>)
  }
  /*
  if (err_box) {
    ++key
    misc.push(<ErrBox position={err_box.position}
      width={err_box.width}
      height={err_box.height}
      key={key} />)
  }
  */
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
  if ('in_between' == config_path.get(0)) {
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
  //console.log('freeze_display', freeze_display)
  //console.log('button_display', button_display)
  for (const special_button in global_constant.special_button_geoms) {
    //if (special_button in button_display)
    if (button_display.has(special_button)) {
      ++key
      let bg_style = {}
      if (freeze_display) {
        bg_style = (special_button === button_highlight) ?
          freeze_highlight_style : freeze_no_highlight_style
      } else if (special_button === button_highlight)
        bg_style = highlight_style
      //console.log('bg_style', bg_style)
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
  //console.log(doors.length)
  return (<View style={styles.workspace}>
    {nums}{tiles}{doors}{portals}
    {misc}
  </View>)
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
  },
  top_right_text: {
    position: 'absolute',
    fontSize: 20,
    top: 0,
  }
})

export default Workspace