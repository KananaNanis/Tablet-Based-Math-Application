import React from 'react'
import { View, Image, Text, Animated, StyleSheet, Dimensions } from 'react-native'
import { Map, toJS } from 'immutable'
import Num from './Num'
import Keypad from './Keypad'
import Button from './Button'
import Tile from './Tile'
import TileContainer from '../containers/TileContainer'
import Placard from './Placard'
import Door from './Door'
import ErrBox from './ErrBox'
import CamelContainer from '../containers/CamelContainer'
import OptionBackground from '../components/OptionBackground'
import { global_constant, image_location } from '../App'
import { query_event_show_camel, query_event, query_option_values } from '../providers/query_store';
import { render_nums, render_tiles, render_doors, render_portals } from './render_geoms';

export const global_screen_width = Dimensions.get('window').width
export const global_screen_height = Dimensions.get('window').height
export const global_grass_height = 50
export const global_workspace_height = global_screen_height - global_grass_height

export const window2workspaceCoords = (pos0) =>
  [pos0[0], global_workspace_height - pos0[1]]


export function start_anim(anim_var, toValue, duration, delay = 0, ending_function) {
  //console.log('start_anim toValue', toValue, 'duration', duration)
  /*
  function onEnd(x) {
    console.log('onEnd x', x)
    anim_var.setValue(0)
  }
  */
  //anim_var.setValue(0)
  Animated.timing(anim_var,
    {
      toValue,
      duration,
      delay,
    }
  ).start(ending_function);
}

const Workspace = ({ scale_factor, keypad_kind, button_display,
  button_highlight, freeze_display, num_stars, config_path,
  tower_ids, tile_ids, door_ids, portal_ids, center_text,
  all_nums, all_tiles, all_doors, all_portals,
  top_left_text, top_right_text, big_op, err_box, option_values }) => {

  //console.log('Workspace all_nums', all_nums, 'all_tiles', all_tiles, 'all_doors', all_doors)
  //console.log('Workspace all_portals', all_portals)
  if ('undefined' === typeof config_path) return []
  //console.log('Workspace config_path', config_path.toJS())
  let doors = [], portals = []
  //nums = render_nums(all_nums, scale_factor)
  const nums = render_nums(tower_ids)
  //const tiles = render_tiles(all_tiles, scale_factor)
  const tiles = render_tiles(tile_ids)
  /*
  for (const i = 0; i < tile_ids.size; ++i)
    tiles.push(<TileContainer id={tile_ids.get(i)} scale_factor={scale_factor} key={tile_ids.get(i)} />)
  */
    /*
  if (tile_ids.size > 0) {
    tiles.push(
        <Tile
        name={'kitty'}
        position={[300,0]}
        scale_factor={scale_factor}
        id={'tile_1'}
        key={'tile_1b'} />
    )
    tiles.push(<TileContainer id={'tile_1'} scale_factor={scale_factor} key={'tile_1'} />)
  }
    */
  //const doors = render_doors(all_doors, skip = null, scale_factor)
  //const portals = render_portals(all_portals, skip = null, all_nums, all_tiles, all_doors, scale_factor)
  //console.log('len', doors.length)
  //console.log('option_values', option_values ? option_values.toJS() : null)
  let misc = [], key = 0, options = []
  if (1) { // add username
    ++key
    misc.push(<Text
      style={styles.username}
      key={key}>{global_constant.username}</Text>)
  }
  if (query_option_values()) {  // add options
    // are the options doors or nums?
    let option_inner = []
    //console.log('nums actual', all_nums.size, 'nums rendered', nums.length)
    //console.log('doors actual', all_doors.size, 'doors rendered', doors.length)
    if (all_doors.size == doors.length + 1)
      option_inner = render_doors(all_doors, skip = null, scale_factor, 0, false, option_values)
    if (tower_ids.size == nums.length + 1)
      option_inner = render_nums(tower_ids, 0, false, option_values)
    for (const i = 0; i < option_inner.length; ++i) {
      ++key
      options.push(<OptionBackground
        i={i}
        button_highlight={button_highlight}
        key={i}>
        {option_inner[i]}
      </OptionBackground>)
    }
  }
  if (err_box) {
    // console.log('err_box', err_box.toJS())
    if (query_event('show_camel')) {
      ++key
      misc.push(<CamelContainer key={key} />)
    }
    if (err_box.has('position')
      && (!query_event('show_camel')
        || (err_box.has('misc') && err_box.getIn(['misc', 'is_thin_height'])))) {
      //console.log('err_box beyond camel')
      let style = {}, err_misc = {}
      if (err_box.get('style')) style = err_box.get('style').toJS()
      if (err_box.get('misc')) err_misc = err_box.get('misc').toJS()
      ++key
      misc.push(<ErrBox
        position={err_box.get('position').toJS()}
        width={err_box.get('width')} height={err_box.get('height')}
        style={style}
        misc={err_misc}
        key={key} />)
    }
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
      { right: global_constant.top_right_text_offset },
      ]}
      key={key}>{top_right_text}</Text>)
  }
  if (top_left_text) {
    ++key
    misc.push(<Text
      style={[styles.top_left_text,
      { left: 0 },
      ]}
      key={key}>{top_left_text}</Text>)
  }
  if (big_op) {
    //console.log(' big_op', big_op)
    ++key
    misc.push(<Text
      style={[styles.big_op ]}
      key={key}>{big_op}</Text>)
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
    'start': { borderColor: 'forestgreen' },
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
      if (freeze_display && 'start' !== special_button) {
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
    {nums}{options}{tiles}{doors}{portals}{misc}
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
  },
  top_left_text: {
    position: 'absolute',
    fontSize: 8,
    top: 0,
  },
  big_op: {
    position: 'absolute',
    fontSize: 200,
    left: 70,
    bottom: 160,
    color: 'grey',
  }
})

export default Workspace
