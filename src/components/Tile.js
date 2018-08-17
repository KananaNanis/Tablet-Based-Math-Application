import React from 'react'
import { StyleSheet, Animated, Image } from 'react-native'
import { global_constant, image_location } from '../App'
import { start_anim } from './Workspace';
import { start_anim_loop } from './Door';

export function current_pixel_size_of_animal(name, extra_scale = 1) {
  const height = extra_scale * global_constant.screen_pixels_per_cm
    * 10 * global_constant.animals[name].height
  const width = height * global_constant.animals[name].pixel_width /
    global_constant.animals[name].pixel_height
  return [width, height]
}

class Tile extends React.Component {
  state = {
    fadeAnim: new Animated.Value(1),  // Initial value for opacity: 1
    loopAnim: new Animated.Value(0),
  }

  componentDidUpdate() {
    let { misc } = this.props
    if (misc && misc.hasOwnProperty('blink')) {
    } else this.state.loopAnim.setValue(0)
  }

  render() {
    let { name, position, style, anim_info, misc, just_grey, extra_scale } = this.props
    //just_grey = true
    //console.log('Tile  name', name)
    let extra_style = {}
    if (just_grey) extra_style = { opacity: 0.1 }
    if (anim_info && anim_info.hasOwnProperty('fade_duration')) {
      start_anim(this.state.fadeAnim, 0, anim_info.fade_duration);
      extra_style = { 'opacity': this.state.fadeAnim }
    }
    if (misc && ('undefined' !== typeof misc.blink) && !just_grey
             && ('undefined' !== typeof misc.blink.target)) {
      start_anim_loop(this.state.loopAnim)
      extra_style = {
        'opacity': this.state.loopAnim.interpolate({
          inputRange: [0, 1], outputRange: [misc.blink.target, 1]
        })
      }
    }
    const [width, height] = current_pixel_size_of_animal(name, extra_scale)
    //console.log('Tile name', name, 'position', position, 'width', width, 'height', height)
    let pos_info = { bottom: position[1] }
    pos_info.left = position[0]
    //console.log('Tile name', name, ' style', style)
    return (
      <Animated.View style={[styles.tile, style, pos_info,
      extra_style,
      {
        width: width,
        height: height + 1,
        borderTopColor: just_grey ? 'grey' : 'orange',
      }]} >
        <Image
          style={{ position: 'absolute', width, height }}
          source={image_location(name, just_grey)} />
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    borderTopWidth: 1,
  },
})

export default Tile