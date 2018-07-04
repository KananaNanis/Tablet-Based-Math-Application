import React from 'react'
import { StyleSheet, View, Text } from 'react-native';
import { global_size2color, global_size2symbol } from '../myglobal';

const Block = ({size, isFiver, opacity, scale_factor, bottom}) => {
  const height = scale_factor * (10**size);
  const width = isFiver ? 1.1*height : height;
  //console.log('scale_factor ' + scale_factor + ' size ' + size + ' sz ' + sz);
  return (
  <View style={[styles.block, {bottom: bottom,
                               backgroundColor: global_size2color[size],
                               borderRadius: 0.1*height,
                               borderLeftWidth: (isFiver ? 0.1*height : 0),
                               borderLeftColor: (isFiver ? '#328' : 'transparent'),
                               width: (width-1), height: (height-1)},
                              (opacity !== null ? {opacity} : {})
               ]} >
    <Text style={{color: '#eee',
                  marginBottom: .15*height,
                  fontSize: .75*height}} >
      {global_size2symbol[size]}</Text>
  </View>
  )
}

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
});

export default Block