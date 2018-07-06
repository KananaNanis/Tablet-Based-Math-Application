import React from 'react'
import { StyleSheet, View } from 'react-native';
import Tower from './Tower';
import TowerName from './TowerName';


const Num = ({id, name, position, block_opacity, scale_factor}) => (
  <View style={[styles.num,
                {left: position[0], bottom: position[1]}
               ]}>
    <Tower id={id} name={name} position={position} block_opacity={block_opacity} scale_factor={scale_factor} />
    <TowerName id={id} name={name} position={position} />
  </View>
)

const styles = StyleSheet.create({
  num: {
    backgroundColor: 'cyan',
    width: 300,
    height: 300,
    position: 'absolute',
  }
});

export default Num
