import React from 'react'
import { StyleSheet, View } from 'react-native';
import Block from './Block.js';
import { myglobal } from '../App.js';

const Tower = ({id, name}) => {
  // expand the name into individual blocks
  //console.log(name);
  let blocks = [];
  let floor = 0;
  for (const group of name) {
    const size = group.charAt(0);
    const height = myglobal.block_height[size];
    const howMany = +group.substr(1);
    //console.log('size ' + size + ' howMany ' + howMany);
    for (const i = 0; i < howMany; ++i) {
      blocks.push(<Block size={size} bottom={floor} key={group+i}/>)
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
