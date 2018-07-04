import React from 'react'
import { StyleSheet, View } from 'react-native';
import Num from './Num';

/* for this view, the style is passed in from above */
/*
const Workspace = ({style, num_desc}) => (
  <View style={style}>
    { num_desc.map((num, i) => 
        <Num id={num.id} name={num.name} position={num.position} key={i}/>)
    } 
  </View>
)
*/
//longer way... perhaps to be used later?
const Workspace = ({style, num_desc, scale_factor}) => {
  //console.log(num_desc[0]);
  let nums = [];
  for (const i = 0; i < num_desc.length; ++i) {
    const num = num_desc[i];
    nums.push(
      <Num id={num.id} name={num.name}
           position={num.position}
           block_opacity={num.block_opacity}
           scale_factor={scale_factor} key={i}/>
    );
  }
  return <View style={style}>{nums}</View>
}
/*
*/

export default Workspace
