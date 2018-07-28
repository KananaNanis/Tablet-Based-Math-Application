import React from 'react'
import { StyleSheet, View, Animated, Image } from 'react-native'
import { start_fade_anim } from './Tower';
import { query_scale_factor } from '../providers/query_store';
import { render_nums, render_tiles, render_doors } from './Workspace';

class Door extends React.Component {
  state = {
    fadeAnim: new Animated.Value(1),  // Initial value for opacity: 1
  }

  render() {
    let { fadeAnim } = this.state
    let { name, position, style, anim_info, scale_factor, id } = this.props
    //console.log('Door  name', name)
    let use_anim = false;
    if (anim_info && anim_info.hasOwnProperty('fade_duration')) {
      start_fade_anim(this.state.fadeAnim, anim_info.fade_duration);
      use_anim = true;
    }
    const height = 1.0 * scale_factor
    const is_portal = id.startsWith("door_p")
    const width = is_portal ? 300 : 0
    //console.log('Door name', name, 'position', position, 'scale_factor', scale_factor, 'height', height)
    let pos_info = { bottom: position[1] }
    pos_info.left = position[0]
    //console.log('Door name', name, ' style', style)
    let bounded_name = (name > 1) ? 1 : (name < .01) ? .01 : name
    const handle_pos = (bounded_name * scale_factor) - 1
    if (is_portal) {
      // this is a portal, so we need to add all the other geometry,
      //   twice!
      let { all_nums, all_tiles, all_doors } = this.props
      let offset_x = -1 * (position[0] + 2)
      const nums_grey = render_nums(all_nums, scale_factor, offset_x = offset_x, just_grey = true)
      const tiles_grey = render_tiles(all_tiles, scale_factor, offset_x = offset_x, just_grey = true)
      const doors_grey = render_doors(all_doors, skip = id, all_nums, all_tiles, scale_factor, offset_x = offset_x, just_grey = true)
      const nums = render_nums(all_nums, scale_factor, offset_x = offset_x)
      const tiles = render_tiles(all_tiles, scale_factor, offset_x = offset_x)
      const doors = render_doors(all_doors, skip = id, all_nums, all_tiles, scale_factor, offset_x = offset_x)
      const transform = [{'scale': bounded_name}]
      return (
        <Animated.View style={[styles.door, styles.portal, style, pos_info,
        use_anim ? { 'opacity': fadeAnim } : {},
        { width, height }]} >
          {nums_grey}{tiles_grey}{doors_grey}
          <View style={[styles.inner, {width, height, transform}]}>
            {nums}{tiles}{doors}
          </View>
          <View style={[styles.handle,
          { width: 0.2 * height, height: 0, bottom: handle_pos }]} />
        </Animated.View>
      )
    } else {
      return (
        <Animated.View style={[styles.door, style, pos_info,
        use_anim ? { 'opacity': fadeAnim } : {},
        { width, height }]} >
          <View style={[styles.handle,
          { width: 0.2 * height, height: 0, bottom: handle_pos }]} />
        </Animated.View>
      )
    }
  }
}

const styles = StyleSheet.create({
  door: {
    position: 'absolute',
    borderLeftWidth: 2,
    borderLeftColor: 'black',
  },
  portal: {
    overflow: 'hidden',
    backgroundColor: 'lightgrey',
    borderBottomRightRadius: 50,
    borderTopRightRadius: 50,
  },
  inner: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: 'white',
    borderBottomRightRadius: 50,
    borderTopRightRadius: 50,
    transformOrigin: 'bottom left',
  },
  handle: {
    position: 'absolute',
    borderTopWidth: 2,
    borderTopColor: 'black',
  },
})

export default Door
