import React from 'react'
import { StyleSheet, Animated, Text } from 'react-native'
import { global_fiver_shadow } from './Num'
import { query_whole_tower } from '../providers/query_store'
import { global_constant } from '../App'
import { start_fade_anim } from './Tower';

class TowerName extends React.Component {
  state = {
    fadeAnim: new Animated.Value(1),  // Initial value for opacity: 1
  }

  render() {
    let { fadeAnim } = this.state;
    let { id, name, position, anim_info } = this.props;
    if (anim_info && anim_info.hasOwnProperty('fade_duration')) {
      start_fade_anim(this.state.fadeAnim, anim_info.fade_duration);
    }
    // expand the name into individual texts
    const name_info = query_whole_tower(id, { name, position })
    /*
    const name_info = [{bottom: 0, quantity: 3, size: 0},
                       {bottom: 40, quantity: 5, size: -1}, ]
    */
    let name_elements = [], height
    for (const i = 0; i < name_info.length; ++i) {
      var size = name_info[i].size
      const is_fiver = name_info[i].is_fiver
      name_elements.push(
        <Text style={[styles.tower_name_element,
        {
          bottom: name_info[i].bottom,
          color: global_constant.tower.size2color[size],
          fontSize: global_constant.tower.size2fontsize[size],
          //paddingLeft: global_constant.tower.size2padding[size],
        },
        global_fiver_shadow[is_fiver],
        name_info[i].style]} key={i}>
          {name_info[i].quantity}
          {' ' + global_constant.tower.size2symbol[size]}
        </Text>
      )
      height = name_info[i].bottom + global_constant.tower.size2fontsize[size]
    }
    height += 5
    //console.log(height)
    return (<Animated.View style={[styles.tower_name,
    { 'opacity': fadeAnim },
    { height }]}>
      {name_elements}
    </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  tower_name: {
    backgroundColor: 'white',
    width: 70,
    position: 'absolute',
    bottom: 10,
    left: 60,
  },
  tower_name_element: {
    position: 'absolute',
    left: 5,
  },
})

export default TowerName