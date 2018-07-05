import React from 'react'
import { StyleSheet, View, Text } from 'react-native';
import Button from './Button';
import { global_size2symbol } from '../myglobal';

const Keypad = ({position, button_width, button_height,
                           space_width, space_height }) => {
  let buttons = [];
  const num_cols = 2;
  const num_rows = 5;
  for(const row = 0; row < num_rows; ++row) {
    for(const col = 0; col < num_cols; ++col) {
      const button_position =
         [col*(button_width + space_width),
          row*(button_height + space_height)];
      //const label = col + num_cols*row;
      const label = global_size2symbol[1 - row];
      const view_style= {backgroundColor:'cyan'};
      let label_style= {};
      if (col%2) label_style = {
        //text-shadow: -3px 0px 0 orange;
        textShadowColor: 'orange',
        textShadowOffset: {width: -3, height: 0},
        textShadowRadius: 0
      };
      buttons.push(
        <Button position={button_position}
          width={button_width} height={button_height}
          view_style={view_style}
          label={label} label_style={label_style} />
      );
    }
  }
  return (
  <View style={[styles.keypad,
                {left: position[0], bottom: position[1]} ]} >
    {buttons}
  </View>
  )
}

const styles = StyleSheet.create({
  keypad: {
    position: 'absolute',
  },
});

export default Keypad