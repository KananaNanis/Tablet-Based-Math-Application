import React from 'react'
import { StyleSheet, Animated, Image } from 'react-native'
import { global_constant, image_location } from '../App'
import { start_anim } from './Workspace';

class Tile extends React.Component {
  state = {
    fadeAnim: new Animated.Value(1),  // Initial value for opacity: 1
  }

  render() {
    let { name, position, style, anim_info, just_grey, extra_scale } = this.props
    //just_grey = true
    //console.log('Tile  name', name)
    let use_anim = false;
    if (anim_info && anim_info.hasOwnProperty('fade_duration')) {
      start_anim(this.state.fadeAnim, 0, anim_info.fade_duration);
      use_anim = true;
    }
    extra_scale = extra_scale || 1.00
    const height = extra_scale * global_constant.screen_pixels_per_cm * 10
      * global_constant.animals[name].height
    const width = height * global_constant.animals[name].pixel_width /
      global_constant.animals[name].pixel_height
    //console.log('Tile name', name, 'position', position, 'width', width, 'height', height)
    let pos_info = { bottom: position[1] }
    pos_info.left = position[0]
    //console.log('Tile name', name, ' style', style)
    return (
      <Animated.View style={[styles.tile, style, pos_info,
      use_anim ? { 'opacity': this.state.fadeAnim } : {},
      {
        width: width + 2,
        height: height + 2,
        borderColor: just_grey ? 'lightgrey' : 'orange',
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
    borderWidth: 1,
  },
})

export default Tile