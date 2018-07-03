import React from 'react'
import { StyleSheet, View } from 'react-native';
import Tower from './Tower';


const Num = ({id, name, position, scaleFactor}) => (
  <View style={[styles.num,
                {left: position[0], bottom: position[1]}
               ]}>
    <Tower id={id} name={name} scaleFactor={scaleFactor} />
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
