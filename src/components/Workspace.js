import React from 'react'
import { View, StyleSheet, Dimensions } from 'react-native';
import Num from './Num';
import Keypad from './Keypad';

export const global_screen_width = Dimensions.get('window').width;
export const global_screen_height = Dimensions.get('window').height;
export const global_grass_height = 100;

export const window2workspaceCoords = (pos0) =>
  [pos0[0], global_screen_height - global_grass_height - pos0[1]]

const Workspace = ({scale_factor, keypad_kind, button_highlight, all_nums}) => {
  let nums = [];
  for (const id in all_nums) {
    const num = all_nums[id];
    nums.push(
      <Num id={id}
           name={num.name}
           position={num.position}
           block_opacity={num.block_opacity}
           scale_factor={scale_factor}
           key={id}/>
    );
  }
  let misc = [];
  if (keypad_kind) misc.push(<Keypad kind={keypad_kind}
                               button_highlight={button_highlight} key={1}/>);
  return <View style={styles.workspace}>{nums}{misc}</View>
}

const styles = StyleSheet.create({
  workspace: {
    //backgroundColor: 'blue',
    height: global_screen_height - global_grass_height,
    width: global_screen_width,
    position: 'absolute',
    left: 0,
    bottom: global_grass_height,
  },
});

export default Workspace