import React from 'react'
import { StyleSheet, View, Text } from 'react-native';

const Block = ({size, bottom}) => (
  <View style={[styles.block, {bottom: bottom}]}>
    <Text>{bottom}</Text>
  </View>
)

const styles = StyleSheet.create({
  block: {
    backgroundColor: 'blue',
    width: 100,
    height: 100,
    position: 'absolute',
  },
});

export default Block
