import React from 'react'
import { StyleSheet, View } from 'react-native';
import Block from './Block';

export function get_block_size_from_group(group) {
  return Math.ceil(-1 + .00001 + (Math.log(group)/Math.log(10)))
}

export function get_how_many_from_group(group) {
  return Math.round(group/(10**get_block_size_from_group(group)));
}

const Tower = ({id, name, block_opacity = [], scale_factor}) => {
  // expand the name into individual blocks
  //console.log(name);
  let blocks = [];
  let floor = 0;
  for (const group of name) {
    const size = get_block_size_from_group(group);
    const height = scale_factor * (10**size);
    const how_many = get_how_many_from_group(group);
    console.assert(how_many <= 5, 'how_many is ' + how_many)
    const isFiver = (5 === how_many);
    //console.log('size ' + size + ' how_many ' + how_many);
    for (const i = 0; i < how_many; ++i) {
      blocks.push(<Block size={size}
                         isFiver={isFiver}
                         opacity={block_opacity[blocks.length]}
                         scale_factor={scale_factor}
                         bottom={floor} key={group+i}/>)
      floor += height;
    }
  }
  return (<View style={styles.tower}>
     {blocks}
    </View>
  )
}

const styles = StyleSheet.create({
  tower: {
    backgroundColor: 'orange',
    width: 200,
    height: 200,
    position: 'absolute',
    bottom: 0
  },
});

export default Tower