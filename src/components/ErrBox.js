import React from 'react'
import { StyleSheet, Animated } from 'react-native'
import { global_constant, image_location } from '../App'
import { start_anim } from './Workspace';

class ErrBox extends React.Component {
  state = {
    fadeAnim: new Animated.Value(1),  // Initial value for opacity: 1
  }

  render() {
    let { position, width, height, style, anim_info } = this.props
    let use_anim = false;
    if (anim_info && anim_info.hasOwnProperty('fade_duration')) {
      start_anim(this.state.fadeAnim, 0, anim_info.fade_duration);
      use_anim = true;
    }
    let err_style = [styles.err_box, style,
      use_anim ? { 'opacity': this.state.fadeAnim } : {},
      {
        width,
        height,
        left: position[0],
        bottom: position[1],
      }]
    return <Animated.View style={err_style} />
  }
}

const styles = StyleSheet.create({
  err_box: {
    position: 'absolute',
    backgroundColor: 'red',
  },
})

export default ErrBox
