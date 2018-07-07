import React from 'react'
//import { StyleSheet } from 'react-native';
//import { global_size2color, global_size2symbol, global_fiver_shadow } from './Num';
import { View, Text } from 'react-native';

const Block = ({view_style, text_style, text_content}) => (
    <View style={view_style}>
      <Text style={text_style}>
        {text_content}
      </Text>
    </View>
)
/*
const Block = ({ size, is_fiver, height, width, opacity, bottom, misc }) => {
  //console.log('scale_factor ' + scale_factor + ' size ' + size + ' sz ' + sz);
  const {small_in_a_row, fiver_in_a_row} = misc;
  const is_small = (height < 10);
  var h;
  if (4 < height) h = height;
  else if (is_small) h = height - 1;
  else h = height - 2;

  if (is_fiver && !is_small && (1==fiver_in_a_row || 5==fiver_in_a_row)) h -= 1;


  const small_style = (width < 10) ? { backgroundColor: 'black'} : {}


  return (
    <View style={[styles.block, fiver_style, {
      bottom,
      borderRadius,
      width,
      height: h,
      marginBottom,
      marginLeft
    },
    small_style,
    (opacity !== null ? { opacity } : {})
    ]} >
      <Text style={[{
        position: 'absolute',
        color,
        left,
        bottom : textBottom,
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
    //backgroundColor: '#dbb',
    //justifyContent: 'center',
    //alignItems: 'center',
  },
});
*/

export default Block