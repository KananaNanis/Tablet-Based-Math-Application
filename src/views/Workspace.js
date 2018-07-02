import React from 'react'
import { StyleSheet, View } from 'react-native';
import Num from './Num.js';

/* for this view, the style is passed in from above */
const Workspace = ({style, num_desc}) => {
  let nums = [];
  for (const i = 0; i < num_desc.length; ++i) {
    const num = num_desc[i];
    nums.push(
      <Num id={num.id} name={num.name} position={num.position} key={i}/>
    );
  }
  return <View style={style}>{nums}</View>
}

export default Workspace
