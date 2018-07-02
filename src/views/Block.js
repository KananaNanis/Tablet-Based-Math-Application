import React from 'react'
import { StyleSheet, View, Text } from 'react-native';
import { myglobal } from '../App.js';

const Block = ({size, bottom}) => {
  const height = myglobal.block_height[size];
  return (
  <View style={[styles.block, {bottom: bottom, width: height, height}]}>
    <Text>{bottom}</Text>
  </View>
  )
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: 'blue',
    width: 100,
    height: 100,
    position: 'absolute',
  },
});

export default Block
