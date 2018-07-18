import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { global_fiver_shadow } from './Num'
import { query_whole_tower } from '../providers/query_store'
import { global_constant } from '../App'

const TowerName = ({ id, name, position }) => {
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
  return (<View style={[styles.tower_name, { height }]}>
    {name_elements}
  </View>
  )
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