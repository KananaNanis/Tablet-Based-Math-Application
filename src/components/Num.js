import React from 'react'
import { StyleSheet, View } from 'react-native';
import Tower from './Tower';


const Num = ({id, name, position, scale_factor}) => (
  <View style={[styles.num,
                {left: position[0], bottom: position[1]}
               ]}>
    <Tower id={id} name={name} scale_factor={scale_factor} />
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
