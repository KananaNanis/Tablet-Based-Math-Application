import React from 'react'
import { StyleSheet, View, Animated, Image } from 'react-native'
import { as_greyscale } from './Tower';
import { start_anim } from './Workspace';
import { render_nums, render_tiles, render_doors } from './render_geoms';
import { global_constant } from '../App';

export function start_anim_loop(anim_var) {
  Animated.loop(
    Animated.sequence([
      Animated.timing(anim_var, {
        toValue: 1,
        duration: 500,
        //delay: 1000
      }),
      Animated.timing(anim_var, {
        toValue: 0,
        duration: 500
      })
    ])
  ).start()
}

class Door extends React.Component {
  state = {
    fadeAnim: new Animated.Value(1),  // Initial value for opacity: 1
    slideAnim: new Animated.Value(0),
    loopAnim: new Animated.Value(0),
    //has_listener: false
    /*
    handlePosAnim: new Animated.Value(
      this.props.scale_factor * (this.props.name[0]
        - global_constant.door.thickness_fraction / 2.)
    ),
    scaleAnim: new Animated.Value(this.props.name[0]),
    */
  }

  componentDidUpdate() {
    let { anim_info } = this.props
    if (anim_info && anim_info.hasOwnProperty('slide_duration')) {
    } else this.state.slideAnim.setValue(0)
    /*
    if (!this.state.has_listener) {
      this.state.has_listener = true
      console.log('adding listener')
      this.state.slideAnim.addListener(function (x) {
        console.log('x', x)
      })
    }
    */
  }

  render() {
    let { name, position, style, anim_info, misc, scale_factor, just_grey, id } = this.props
    //console.log('Door  id', id, 'style', style, 'misc', misc)

    const is_portal = id.startsWith("portal_")
    const height = 1.0 * scale_factor
    //console.log('scale_factor', scale_factor)
    const width = is_portal ? global_constant.door.portal_width : 0
    const thickness = height * global_constant.door.thickness_fraction
    //console.log('Door name', name, 'position', position, 'scale_factor', scale_factor, 'height', height)
    //console.log('Door name', name, ' style', style)
    let frame_color = global_constant.door.frame_color
    let portal_bg_color = global_constant.door.portal_bg_color
    if (just_grey) {
      //frame_color = as_greyscale(frame_color)
      portal_bg_color = as_greyscale(portal_bg_color)
      frame_color = global_constant.door.frame_color_grey
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
    if (misc && ('undefined' !== typeof misc.blink ||
      'undefined' !== typeof misc.handle_blink))
      start_anim_loop(this.state.loopAnim)
    if (misc && ('undefined' !== typeof misc.blink)) {
      door_style.push({
        'opacity': this.state.loopAnim.interpolate({
          inputRange: [0, 1], outputRange: [misc.blink, 1]
        })
      })
    }
    let bounded_name = (name[0] > 1) ? 1 : (name[0] < 0) ? 0 : name[0]
    if (is_portal && name[0] < global_constant.door.portal_min_value)
      name[0] = global_constant.door.portal_min_value
    const handle_bot = (bounded_name * scale_factor) - thickness / 2.
    let handle_style = [styles.handle, {
      width: global_constant.door.handle_fraction * height,
      bottom: handle_bot,
      borderTopWidth: thickness,
      borderTopColor: frame_color,
    }]
    if (misc && 'undefined' !== typeof misc.handle_opacity)
      handle_style.push({ opacity: misc.handle_opacity })
    if (misc && ('undefined' !== typeof misc.handle_blink)) {
      handle_style.push({
        'opacity': this.state.loopAnim.interpolate({
          inputRange: [0, 1], outputRange: [misc.handle_blink, 1]
        })
      })
    }
    //if ('door_p1' == id) anim_info = { slide_duration: 2000 }
    if (anim_info && anim_info.hasOwnProperty('slide_duration')) {
      /*
      start_anim(this.state.handlePosAnim, scale_factor * name[1]
        - thickness / 2., anim_info.slide_duration);
      handle_style.push({ 'bottom': this.state.handlePosAnim })
      */
      start_anim(this.state.slideAnim, 1, anim_info.slide_duration);
      let end_bot
      if (anim_info.hasOwnProperty('slide_target'))
        end_bot = scale_factor * anim_info.slide_target - thickness / 2.
      else if (name.length > 1)
        end_bot = scale_factor * name[1] - thickness / 2.
      else end_bot = handle_bot
      handle_style.push({
        'bottom': this.state.slideAnim.interpolate({
          inputRange: [0, 1], outputRange: [handle_bot, end_bot]
        })
      })
    }
    if (misc && misc.handle_color && !just_grey) {
      handle_style.push({'borderTopColor': misc.handle_color})
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
      const doors_grey = render_doors(all_doors, skip = id, scale_factor, offset_x = offset_x, just_grey = true)
      const nums = render_nums(all_nums, scale_factor, offset_x = offset_x)
      const tiles = render_tiles(all_tiles, scale_factor, offset_x = offset_x)
      const doors = render_doors(all_doors, skip = id, scale_factor, offset_x = offset_x)
      const transform = [{ 'scale': bounded_name }]
      let inner_style = [styles.inner, {
        width, height, transform,
        borderBottomRightRadius: global_constant.door.border_radius,
        borderTopRightRadius: global_constant.door.border_radius,
      }]
      if (anim_info && anim_info.hasOwnProperty('slide_duration')) {
        //inner_style.push({ transform: [{ scale: .5}] })
        /*
        start_anim(this.state.scaleAnim, name[1],
          anim_info.slide_duration);
        inner_style.push({ transform: [{ scale: this.state.scaleAnim }] })
        */
        let end_scale
        if (anim_info.hasOwnProperty('slide_target'))
          end_scale = anim_info.slide_target
        else if (name.length > 1)
          end_scale = name[1]
        else end_scale = bounded_name
        inner_style.push({
          transform: [{
            scale: this.state.slideAnim.interpolate({
              inputRange: [0, 1], outputRange: [bounded_name, end_scale]
            })
          }]
        })
        //console.log(inner_style)
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
          {handles}
        </Animated.View>
      )
    }
  }
}

const styles = StyleSheet.create({
  door: {
    position: 'absolute',
    borderRightWidth: 1,
    borderRightColor: 'lightgrey',
    borderTopWidth: 1,
    borderTopColor: 'lightgrey',
  },
  portal: {
    overflow: 'hidden',
  },
  inner: {
    position: 'absolute',
    overflow: 'hidden',
    //backgroundColor: 'white',
    transformOrigin: 'bottom left',
  },
  handle: {
    position: 'absolute',
    height: 0,
  },
})

export default Door
