import React from 'react'
import Block from './Block'
import { StyleSheet, Animated, Text } from 'react-native'
import { query_tower_blocks } from '../providers/query_store'
import { global_workspace_height } from './Workspace'
import { global_fiver_shadow } from './Num'
import { global_constant } from '../App'

export function start_fade_anim(anim_var, duration) {
  Animated.timing(anim_var,
    {
      toValue: 0,
      duration: duration,
    }
  ).start();
}

class Tower extends React.Component {
  state = {
    fadeAnim: new Animated.Value(1),  // Initial value for opacity: 1
  }

  render() {
    let { fadeAnim } = this.state;
    let { id, name, position, style = {}, anim_info = {}, block_opacity = [] } = this.props
    //console.log('id', id, 'name', name)
    if (anim_info && anim_info.hasOwnProperty('fade_duration')) {
      start_fade_anim(this.state.fadeAnim, anim_info.fade_duration);
    }

    const block_info = query_tower_blocks(id, { name, position, block_opacity })

    let blocks = [], small_in_a_row = 0
    //let fiver_in_a_row = 0, prev_size = null
    for (const i = 0; i < block_info.length; ++i) {
      // compute all the style info for the blocks here, where we have context
      const b = block_info[i]
      const is_small = b.height < 10
      const is_tiny = b.height < 4
      const is_fiver = b.is_fiver
      const size = b.size
      //console.log('size', size)
      if (is_small && !is_fiver)++small_in_a_row
      else small_in_a_row = 0

      const width = b.width
      let height = b.height
      const bottom = b.bottom
      let marginBottom = (is_tiny || is_fiver) ? 0 : 1
      const radius = 0.1 * (.5 * (height + width))
      let radius_style = {}
      if (false && is_fiver) {
        if (1 == fiver_in_a_row || 5 == fiver_in_a_row)
          height -= 1
        if (1 == fiver_in_a_row) {
          marginBottom = 1
          radius_style = {
            borderBottomLeftRadius: radius,
            borderBottomRightRadius: radius
          }
        }
        if (5 == fiver_in_a_row) {
          radius_style = {
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius
          }
        }
      } else {
        if (is_tiny) height -= 0
        else if (is_small) height -= 1
        else height -= 2
        if (!is_small) radius_style = { borderRadius: radius }
      }
      let marginLeft = 0
      if (is_small) {
        if (//is_fiver || 
          !(small_in_a_row % 2)) marginLeft = 1
      }
      let img_name = null
      if (-1 === size && !is_fiver) img_name = 'turtle'
      else if (-1 === size && is_fiver) img_name = 'fiverTurtle'
      else if (0 === size && !is_fiver) img_name = 'unit'
      let view_style = {
        position: 'absolute',
        backgroundColor: (width < 10) ? 'black' : '#dbb',
        bottom,
        marginBottom,
        marginLeft,
        //...fiver_style
      }

      let text_content = global_constant.tower.size2symbol[size]
      const color = global_constant.tower.size2color[size]
      const left = 15 + ((size >= 0) ? -.19 * height : 0)
      let textBottom = ((0 === size) ? .25 : (-2 === size) ? -1 : .10) * height
      let fontSize = (is_tiny ? 0 : is_small ? 2 : .75) * height
      if (is_fiver) {
        text_content += "\n" + text_content + "\n" + text_content + "\n" + text_content + "\n" + text_content
        fontSize /= 5
        textBottom *= .8
      }
      let text_style = {
        position: 'absolute',
        fontSize,
        color,
        left,
        bottom: textBottom,
        ...global_fiver_shadow[is_fiver]
      }
      blocks.push(<Block width={width}
        height={height}
        radius_style={radius_style}
        img_name={img_name}
        view_style={view_style}
        text_style={text_style}
        text_content={text_content}
        key={i} />)
    }
    return (<Animated.View style={[
      styles.tower,
      { 'height': global_workspace_height },
      { 'opacity': fadeAnim },
      style,
    ]}>
      {blocks}
    </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  tower: {
    position: 'absolute',
    bottom: 0,
  },
})

export default Tower