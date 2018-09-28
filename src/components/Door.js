import React from 'react'
import { Map, fromJS } from 'immutable'
import { StyleSheet, View, Animated, Image } from 'react-native'
import { as_greyscale } from './Tower';
import { start_anim } from './Workspace';
import { render_nums, render_tiles, render_doors } from './render_geoms';
import { global_constant, doAction } from '../App';
import { apply_bounds, set_primary_height, tlog, elapsed_time } from '../event/utils';

export function start_anim_loop(anim_var, delay = 0) {
  //console.log('start_anim_loop delay', delay)
  Animated.sequence([
    Animated.delay(delay),
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim_var, {
          toValue: 1,
          duration: 500,
        }),
        Animated.timing(anim_var, {
          toValue: 0,
          duration: 500
        })
      ])
    )
  ]).start()
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
    const { id } = this.props
    //if ('portal_1' == id) tlog('Door', id, 'componentDidUpate')
    let { anim_info } = this.props
    const clear_anim_info = (f) => {
      let { anim_info } = this.props
      //console.log('clear_anim_info', anim_info)
      if (f.finished && anim_info) {
        doAction.setAnimInfo(id, null)
      }
    }
    if (anim_info && anim_info.hasOwnProperty('zoom')) {
      //if ('portal_1' == id) tlog('  STARTING ANIMATION')
      let timings = []
      for (const i = 0; i < anim_info.time.length; ++i) {
        const t = anim_info.time[i]
        timings.push(
          Animated.timing(this.state.slideAnim,
            {
              toValue: (i + 1) % 2,
              duration: t.duration,
              delay: t.delay
            }
          )
        )
      }
      this.state.slideAnim.setValue(0)
      Animated.sequence(timings).start(clear_anim_info)
    }
    if (anim_info && anim_info.hasOwnProperty('slide_duration')) {
      //if ('door_2' == id) tlog('  STARTING ANIMATION')
      //Animated.timing(this.state.slideAnim).stop()
      //this.state.slideAnim.setValue(0)
      start_anim(this.state.slideAnim, 1,
        anim_info.slide_duration)
      // really doesn't like this:
      //set_primary_height(id, anim_info.target)
    }
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
    //console.log('Door  id', id, 'name', name, 'scale_factor', scale_factor)
    //if (!name) name = [.1]
    //console.log('Door  id', id, 'style', style, 'anim_info', anim_info, 'misc', misc)

    const is_portal = id.startsWith("portal_")
    const extra_scale = (misc && 'undefined' !== typeof misc.extra_scale) ? misc.extra_scale : 1
    const height = 1.0 * scale_factor * extra_scale
    //console.log('scale_factor', scale_factor)
    const width = is_portal ? global_constant.door.portal_width * extra_scale : 0
    let thickness = height * global_constant.door.thickness_fraction
    if (thickness < 1) thickness = 1
    //console.log('Door name', name, 'position', position, 'scale_factor', scale_factor, 'height', height)
    //console.log('Door name', name, ' style', style)
    //console.log('Door name', name, 'thickness', thickness)
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
    if (misc && ('undefined' !== typeof misc.is_option)) {
      door_style.push({position: null})
    }
    if (anim_info && anim_info.hasOwnProperty('fade_duration')) {
      start_anim(this.state.fadeAnim, 0, anim_info.fade_duration);
      door_style.push({ 'opacity': this.state.fadeAnim })
    }
    if (misc && ('undefined' !== typeof misc.blink ||
      'undefined' !== typeof misc.handle_blink)) {
      let delay
      if ('undefined' !== typeof misc.blink && misc.blink.delay)
        delay = misc.blink.delay
      //console.log('id', id, 'blink', misc.blink)
      start_anim_loop(this.state.loopAnim, delay)
    }
    if (misc && ('undefined' !== typeof misc.blink)) {
      door_style.push({
        'opacity': this.state.loopAnim.interpolate({
          inputRange: [0, 1], outputRange: [misc.blink.target, 1]
        })
      })
    }
    let bounded_name = apply_bounds(name[0], 0, 2)
    if (is_portal && name[0] < global_constant.door.portal_min_value)
      name[0] = global_constant.door.portal_min_value
    const handle_bot = (bounded_name * scale_factor * extra_scale) - thickness / 2.
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
      let start_bot = handle_bot
      let flip = anim_info.hasOwnProperty('flip')
      if (anim_info.hasOwnProperty('slide_source'))
        start_bot = scale_factor * anim_info.slide_source - thickness / 2.
      let end_bot
      if (anim_info.hasOwnProperty('slide_target'))
        end_bot = scale_factor * anim_info.slide_target - thickness / 2.
      else if (name.length > 1)
        end_bot = scale_factor * name[1] - thickness / 2.
      else end_bot = handle_bot
      // tlog('starting slide from', start_bot, 'to', end_bot)
      //this.state.slideAnim.setValue(0)
      if (false && flip) {
        handle_style.push({
          'bottom': this.state.slideAnim.interpolate({
            inputRange: [1, 2], outputRange: [start_bot, end_bot]
          })
        })
        start_anim(this.state.slideAnim, 2, anim_info.slide_duration)
      } else {
        handle_style.push({
          'bottom': this.state.slideAnim.interpolate({
            inputRange: [0, 1], outputRange: [start_bot, end_bot]
          })
        })
        //start_anim(this.state.slideAnim, 1, anim_info.slide_duration)
        //if (elapsed_time() < 5000) start_anim(this.state.slideAnim, 1, anim_info.slide_duration, 0, ()=>{this.setState({redo: true})})
      }
    }
    if (anim_info && anim_info.hasOwnProperty('zoom')) {
      const start_bot = scale_factor * anim_info.source - thickness / 2.
      const end_bot = scale_factor * anim_info.target - thickness / 2.
      //tlog('starting zoom from', start_bot, 'to', end_bot)
      handle_style.push({
        'bottom': this.state.slideAnim.interpolate({
          inputRange: [0, 1], outputRange: [start_bot, end_bot]
        })
      })
    }
    if (misc && misc.handle_color && !just_grey) {
      handle_style.push({ 'borderTopColor': misc.handle_color })
    }
    if (misc && ('undefined' !== typeof misc.stealth_mode))
      handle_style.push({ 'borderTopColor': 'transparent' })
    //console.log('handle_style', handle_style)
    let handles = [<Animated.View style={handle_style} key={1} />]
    if (name.length > 1) {  // add a second handle
      handles.push(<View style={[handle_style,
        {
          opacity: 0.25,
          bottom: (name[1] * scale_factor * extra_scale) - thickness / 2.,
        }
      ]} key={2} />)
    }
    if (is_portal) {
      // this is a portal, so we need to add all the other geometry,
      //   twice!
      //console.log('id', id, 'scale_factor', scale_factor, 'misc', misc)
      door_style.unshift(styles.portal)
      door_style.push({
        borderBottomRightRadius: global_constant.door.border_radius,
        borderTopRightRadius: global_constant.door.border_radius,
      })
      if (misc && ('undefined' !== typeof misc.stealth_mode))
        door_style.push({
          'borderLeftColor': 'transparent',
          'borderTopColor': 'transparent',
          'borderRightColor': 'transparent',
        })
      // let { all_nums, all_tiles, all_doors } = this.props
      let { tower_ids, tile_ids, door_ids } = this.props
      if (!Map.isMap(tower_ids)) tower_ids = fromJS(tower_ids)
      if (!Map.isMap(tile_ids)) tile_ids = fromJS(tile_ids)
      if (!Map.isMap(door_ids)) door_ids = fromJS(door_ids)
      //console.log('id', id, 'door_ids', door_ids)
      let offset_x = -1 * (position[0] + thickness)
      let nums_grey, tiles_grey, doors_grey
      if (!misc || ('undefined' === typeof misc.stealth_mode)) {
        /*
        nums_grey = render_nums(all_nums, scale_factor, offset_x = offset_x, just_grey = true)
        tiles_grey = render_tiles(all_tiles, scale_factor, offset_x = offset_x, just_grey = true)
        doors_grey = render_doors(all_doors, skip = id, scale_factor, offset_x = offset_x, just_grey = true)
        */
        nums_grey = render_nums(tower_ids, offset_x = offset_x, just_grey = true)
        tiles_grey = render_tiles(tile_ids, offset_x = offset_x, just_grey = true)
        doors_grey = render_doors(door_ids, skip = id, offset_x = offset_x, just_grey = true)
      }
      /*
      const nums = render_nums(all_nums, scale_factor, offset_x = offset_x)
      const tiles = render_tiles(all_tiles, scale_factor, offset_x = offset_x)
      const doors = render_doors(all_doors, skip = id, scale_factor, offset_x = offset_x)
      */
      const nums = render_nums(tower_ids, offset_x = offset_x)
      const tiles = render_tiles(tile_ids, offset_x = offset_x)
      const doors = render_doors(door_ids, skip = id, offset_x = offset_x)
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
      if (anim_info && anim_info.hasOwnProperty('zoom')) {
        inner_style.push({
          transform: [{
            scale: this.state.slideAnim.interpolate({
              inputRange: [0, 1], outputRange: [bounded_name, anim_info.target]
            })
          }]
        })
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
