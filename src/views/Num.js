import React from 'react'
import { StyleSheet, View } from 'react-native';
import Tower from './Tower.js';


const Num = ({id, name, position}) => (
  <View style={[styles.num,
                {left: position[0], bottom: position[1]}
               ]}>
    <Tower id={id} name={name} />
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
