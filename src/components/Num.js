import React from 'react'
import { StyleSheet, View } from 'react-native';
import Tower from './Tower';
import TowerName from './TowerName';

export const global_size2color = {
  '-3': 'limegreen', '-2': 'purple', '-1': 'darkred',
  '0': 'blue', '1': 'green', '2': 'orange', '3': 'cyan'
};
export const global_size2symbol = {
  '-3': '-', '-2': '^', '-1': 'o', '0': '|',
  '1': '\u25A1', '2': '\u25EB', '3': '\u25E7'
};
export const global_size2fontsize = {
  '-3': 25, '-2': 30, '-1': 35, '0': 40,
  '1': 45, '2': 50, '3': 55
};
export const global_size2padding = {
  '-3': 60, '-2': 50, '-1': 40, '0': 30,
  '1': 20, '2': 10, '3': 0
};
export const global_fiver_shadow = [
  {},
  { textShadowColor: 'orange',
    textShadowOffset: { width: -3, height: 0 },
    textShadowRadius: 0 },
  { textShadowColor: 'orange',
    textShadowOffset: { width: 3, height: 0 },
    textShadowRadius: 0 },
];

export function get_block_size_from_group(group) {
  return Math.ceil(-1 + .00001 + (Math.log(group) / Math.log(10)))
}

export function get_how_many_from_group(group) {
  var n = Math.round(group / (10 ** get_block_size_from_group(group)));
  if (n > 5) n -= 5;
  return n;
}

export function get_is_fiver_from_group(group) {
  var n = Math.round(group / (10 ** get_block_size_from_group(group)));
  return n >= 5 ? 1 : 0;
}

export function remove_block_from_name(name0)
{
  //console.log('remove_block_from_name', name0)
  let name = name0.slice()
  if(0 == name.length) return name;
  let group = name.pop()
  let size = get_block_size_from_group(group)
  let how_many = get_how_many_from_group(group)
  let is_fiver = get_is_fiver_from_group(group)
  if (how_many > 1) {
    // the following special case is due to the convention for handling
    //   fivers using the quantity in the tower name
    if (is_fiver) name.push((5+how_many-1) * (10**size))
    else name.push((how_many-1) * (10**size))
  }
  return name
}

export function add_block_to_name(new_size, new_is_fiver, name0)
{
  let new_group = (new_is_fiver ? 6 : 1) * 10**new_size;
  if(0 == name0.length) return [new_group];
  let name = name0.slice()
  let group = name[name.length - 1]
  let size = get_block_size_from_group(group)
  let how_many = get_how_many_from_group(group)
  let is_fiver = get_is_fiver_from_group(group)
  if ((size !== new_size) || (new_is_fiver !== is_fiver) || (5 == how_many)) {
    name.push(new_group)
  } else {  // same size and is_fiver, with less than 5
    if (is_fiver) name[name.length - 1] = (5 + how_many + 1) * 10**size;
    else {
      if (how_many < 4) name[name.length - 1] = (how_many + 1) * 10**size;
      else name.push(new_group);
    }
  }
  return name;
}

const Num = ({ id, name, position, tower_style, block_opacity, scale_factor }) => (
  <View style={[styles.num,
  { left: position[0], bottom: position[1] }
  ]}>
    <Tower id={id} name={name} position={position} style={tower_style} block_opacity={block_opacity} scale_factor={scale_factor} />
    <TowerName id={id} name={name} position={position} />
  </View>
)

const styles = StyleSheet.create({
  num: {
    position: 'absolute',
  }
});

export default Num