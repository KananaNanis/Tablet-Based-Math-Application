import React from 'react'
import { StyleSheet, View, Text } from 'react-native';
import { global_size2color, global_size2symbol, global_fiver_shadow } from './Num';

const Block = ({ size, is_fiver, height, width, opacity, scale_factor, bottom }) => {
  //console.log('scale_factor ' + scale_factor + ' size ' + size + ' sz ' + sz);
  const fiver_style = [{}, {
    borderLeftWidth: 0.1 * height,
    borderLeftColor: '#633',
  }, {
    borderRightWidth: 0.1 * height,
    borderRightColor: '#633',
  }][is_fiver];
  return (
    <View style={[styles.block, fiver_style, {
      bottom: bottom,
      borderRadius: 0.1 * height,
      width: (width - 1), height: (height - 1)
    },
    (opacity !== null ? { opacity } : {})
    ]} >
      <Text style={[{
        color: global_size2color[size],
        position: 'absolute',
        left: 13, // NOTE:  find a better solution for this!
        marginBottom: .15 * height,
        fontSize: .75 * height
      },
      global_fiver_shadow[is_fiver]]} >
        {global_size2symbol[size]}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    backgroundColor: '#dbb',
    //justifyContent: 'center',
    //alignItems: 'center',
    marginBottom: 1,
  },
});

export default Block