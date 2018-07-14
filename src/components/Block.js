import React from 'react'
import { View, Image, Text } from 'react-native'

export function get_block_size_from_group(group) {
  return Math.ceil(-1 + .00001 + (Math.log(group) / Math.log(10)))
}

export function get_how_many_from_group(group) {
  var n = Math.round(group / (10 ** get_block_size_from_group(group)))
  if (n > 5) n -= 5
  return n
}

export function get_is_fiver_from_group(group) {
  var n = Math.round(group / (10 ** get_block_size_from_group(group)))
  return n >= 5 ? 1 : 0
}

export function get_fiver_incomplete_from_group(group) {
  var n = Math.round(group / (10 ** get_block_size_from_group(group)))
  return n > 5;
}

export function remove_block_from_name(name0) {
  //console.log('remove_block_from_name', name0)
  let name = name0.slice()
  if (0 == name.length) return name
  let group = name.pop()
  let size = get_block_size_from_group(group)
  let how_many = get_how_many_from_group(group)
  let is_fiver = get_is_fiver_from_group(group)
  if (how_many > 1 && !is_fiver) {
    // the following special case is due to the convention for handling
    //   fivers using the quantity in the tower name
    if (is_fiver) name.push((5 + how_many - 1) * (10 ** size))
    else name.push((how_many - 1) * (10 ** size))
  }
  return name
}

export function add_block_to_name(new_size, new_is_fiver, name0) {
  let new_group = (new_is_fiver ? 5 : 1) * 10 ** new_size
  if (0 == name0.length) return [new_group]
  let name = name0.slice()
  let group = name[name.length - 1]
  let size = get_block_size_from_group(group)
  let how_many = get_how_many_from_group(group)
  let is_fiver = get_is_fiver_from_group(group)
  if ((size !== new_size) || (new_is_fiver !== is_fiver) || (5 == how_many)) {
    name.push(new_group)
  } else {  // same size and is_fiver, with less than 5
    if (is_fiver) {
      const extra = (how_many < 4) ? 5 : 0
      name[name.length - 1] = (how_many + 1 + extra) * 10 ** size
    } else {
      if (how_many < 4) name[name.length - 1] = (how_many + 1) * 10 ** size
      else name.push(new_group)
    }
  }
  return name
}

const Block = ({ width, height, radius_style, img_name, view_style, text_style, text_content }) => {
  let img = null;
  if (img_name) {
    img = (<Image style={[radius_style,
                    {position: 'absolute', width, height }]}
      source={require('../assets/img/' + img_name + '.png')} />)
  }
  return (<View style={[view_style, radius_style, {width, height}]}>
    {img}
    <Text style={text_style}>
      {text_content}
    </Text>
  </View>)
}

export default Block