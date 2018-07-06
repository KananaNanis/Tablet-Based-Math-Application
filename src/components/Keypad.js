import React from 'react'
import { StyleSheet, View } from 'react-native';
import Button from './Button';
import { global_size2color, global_size2symbol, global_fiver_shadow } from './Tower';

export function getButtonGeomsFor(kind)
{
  const pos = getPositionInfoForKeypad(kind);
  let geoms = [];
  for(const row = 0; row < pos.num_rows; ++row) {
    for(const col = 0; col < pos.num_cols; ++col) {
      geoms.push(
         [col*(pos.button_width + pos.space_width),
          row*(pos.button_height + pos.space_height),
          pos.button_width,
          pos.button_height,
        ]
      );
    }
  }
  return geoms;
}

export function getPositionInfoForKeypad(kind)
{
  let res = { position: [70, 100],
           button_width: 50, button_height: 50,
           space_width: 20, space_height: 30 };
  if ("buildTower" == kind) {
    res['num_cols'] = 2;
    res['num_rows'] = 5;
  } else {  // default is decimal keypad
    res['num_cols'] = 3;
    res['num_rows'] = 4;
  }
  return res;
}

const Keypad = ({kind, button_highlight}) => {
  let buttons = [];
  const pos = getPositionInfoForKeypad(kind);
  const geoms = getButtonGeomsFor(kind);
  for(const row = 0; row < pos.num_rows; ++row) {
    for(const col = 0; col < pos.num_cols; ++col) {
      const index = col + pos.num_cols*row;
      const button_position = [geoms[index][0], geoms[index][1]];
      let label = index, label_style = {};  // default
      if ("buildTower" == kind) {
        label = global_size2symbol[1 - row];
        label_style = {color: global_size2color[1-row]};
        if (col%2) label_style = { ...global_fiver_shadow, ...label_style};
      }
      const view_style= {backgroundColor:'grey'};
      if (null !== button_highlight && index == button_highlight)
        view_style['backgroundColor'] = 'yellow';
      buttons.push(
        <Button position={button_position}
          width={pos.button_width} height={pos.button_height}
          view_style={view_style}
          label={label} label_style={label_style} key={index}/>
      );
    }
  }
  return (
  <View style={[styles.keypad,
                {left: pos.position[0], bottom: pos.position[1]} ]} >
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