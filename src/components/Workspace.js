import React from 'react'
import { StyleSheet, View } from 'react-native';
import Num from './Num';

/* for this view, the style is passed in from above */
/*
const Workspace = ({style, all_nums}) => (
  <View style={style}>
    { all_nums.map((num, i) => 
        <Num id={num.id} name={num.name} position={num.position} key={i}/>)
    } 
  </View>
)
*/
//longer way... perhaps to be used later?
const Workspace = ({style, all_nums, scale_factor}) => {
  //console.log(all_nums[0]);
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
  return <View style={style}>{nums}</View>
}

export default Workspace