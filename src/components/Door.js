import React from 'react'
import { StyleSheet, View, Animated, Image } from 'react-native'
import { as_greyscale } from './Tower';
import { start_anim, render_nums, render_tiles, render_doors } from './Workspace';
import { global_constant } from '../App';

class Door extends React.Component {
  state = {
    fadeAnim: new Animated.Value(1),  // Initial value for opacity: 1
    handlePosAnim: new Animated.Value(
      this.props.scale_factor * (this.props.name[0]
        - global_constant.door.thickness_fraction / 2.)
    ),
    scaleAnim: new Animated.Value(this.props.name[0]),
  }

  render() {
    let { name, position, style, anim_info, scale_factor, just_grey, id } = this.props
    //console.log('Door  name', name)

    const is_portal = id.startsWith("door_p")
    const height = 1.0 * scale_factor
    const width = is_portal ? 300 : 0
    const thickness = height * global_constant.door.thickness_fraction
    //console.log('Door name', name, 'position', position, 'scale_factor', scale_factor, 'height', height)
    //console.log('Door name', name, ' style', style)
    let frame_color = global_constant.door.frame_color
    let portal_bg_color = global_constant.door.portal_bg_color
    if (just_grey) {
      frame_color = as_greyscale(frame_color)
      portal_bg_color = as_greyscale(portal_bg_color)
    }
    let door_style = [styles.door, style, {
      width,
      height,
      left: position[0],
      bottom: position[1],
      borderLeftWidth: thickness,
      borderLeftColor: frame_color,
      backgroundColor: portal_bg_color,
    }]
    if (anim_info && anim_info.hasOwnProperty('fade_duration')) {
      start_anim(this.state.fadeAnim, 0, anim_info.fade_duration);
      door_style.push({ 'opacity': this.state.fadeAnim })
    }
    let bounded_name = (name[0] > 1) ? 1 : (name[0] < .01) ? .01 : name[0]
    let handle_style = [styles.handle, {
      width: global_constant.door.handle_fraction * height,
      bottom: (bounded_name * scale_factor) - thickness / 2.,
      borderTopWidth: thickness,
      borderTopColor: frame_color,
    }]
    //if ('door_p1' == id) anim_info = { slide_duration: 2000 }
    if (anim_info && anim_info.hasOwnProperty('slide_duration') && name.length > 1) {
      start_anim(this.state.handlePosAnim, scale_factor * name[1]
        - thickness / 2., anim_info.slide_duration);
      handle_style.push({ 'bottom': this.state.handlePosAnim })
    }
    if (is_portal) {
      // this is a portal, so we need to add all the other geometry,
      //   twice!
      door_style.unshift(styles.portal)
      door_style.push({
        borderBottomRightRadius: global_constant.door.border_radius,
        borderTopRightRadius: global_constant.door.border_radius,
      })
      let { all_nums, all_tiles, all_doors } = this.props
      let offset_x = -1 * (position[0] + thickness)
      const nums_grey = render_nums(all_nums, scale_factor, offset_x = offset_x, just_grey = true)
      const tiles_grey = render_tiles(all_tiles, scale_factor, offset_x = offset_x, just_grey = true)
      const doors_grey = render_doors(all_doors, skip = id, all_nums, all_tiles, scale_factor, offset_x = offset_x, just_grey = true)
      const nums = render_nums(all_nums, scale_factor, offset_x = offset_x)
      const tiles = render_tiles(all_tiles, scale_factor, offset_x = offset_x)
      const doors = render_doors(all_doors, skip = id, all_nums, all_tiles, scale_factor, offset_x = offset_x)
      const transform = [{ 'scale': bounded_name }]
      let inner_style = [styles.inner, {
        width, height, transform,
        borderBottomRightRadius: global_constant.door.border_radius,
        borderTopRightRadius: global_constant.door.border_radius,
      }]
      if (anim_info && anim_info.hasOwnProperty('slide_duration') && name.length > 1) {
        start_anim(this.state.scaleAnim, name[1],
          anim_info.slide_duration);
        inner_style.push({ transform: [{ scale: this.state.scaleAnim }] })
        //inner_style.push({ transform: [{ scale: .5}] })
        //console.log(inner_style)
      }
      let handles = [<Animated.View style={handle_style} key={1} />]
      if (name.length > 1) {  // add a second handle
        handles.push(<View style={[handle_style,
          {
            opacity: 0.25,
            bottom: (name[1] * scale_factor) - thickness / 2.,
          }
        ]} key={2} />)
      }
      return (
        <Animated.View style={door_style} >
          {nums_grey}{tiles_grey}{doors_grey}
          <Animated.View style={inner_style}>{nums}{tiles}{doors}</Animated.View>
          {handles}
        </Animated.View>
      )
    } else {
      return (
        <Animated.View style={door_style} >
          <View style={handle_style} />
        </Animated.View>
      )
    }
  }
}

const styles = StyleSheet.create({
  door: {
    position: 'absolute',
  },
  portal: {
    overflow: 'hidden',
  },
  inner: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: 'white',
    transformOrigin: 'bottom left',
  },
  handle: {
    position: 'absolute',
    height: 0,
  },
})

export default Door
