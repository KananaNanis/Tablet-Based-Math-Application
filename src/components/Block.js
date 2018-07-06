import React from 'react'
import { StyleSheet, View, Text } from 'react-native';
import { global_size2color, global_size2symbol } from './Tower';

const Block = ({size, isFiver, height, width, opacity, scale_factor, bottom}) => {
  //console.log('scale_factor ' + scale_factor + ' size ' + size + ' sz ' + sz);
  return (
  <View style={[styles.block, {bottom: bottom,
                               borderRadius: 0.1*height,
                               borderLeftWidth: (isFiver ? 0.1*height : 0),
                               borderLeftColor: (isFiver ? '#328' : 'transparent'),
                               width: (width-1), height: (height-1)},
                              (opacity !== null ? {opacity} : {})
               ]} >
    <Text style={{color: global_size2color[size],
                  marginBottom: .15*height,
                  fontSize: .75*height}} >
      {global_size2symbol[size]}</Text>
  </View>
  )
}

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    backgroundColor: '#dbb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
});

export default Block