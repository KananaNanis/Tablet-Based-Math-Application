import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Block from './views/Block.js';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    console.log(Dimensions.get('window').height);
  }
  render() {
    return (
      <View style={styles.root}>
        <View style={styles.grass} />
        <View style={styles.workspace}>
          <Block size='u' bottom={10} />
        </View>
      </View>
    );
  }
}

var global = {
  screen_width: Dimensions.get('window').width,
  screen_height: Dimensions.get('window').height,
  grass_height: 100
}

const styles = StyleSheet.create({
  root: {
    //backgroundColor: 'white',  // appears to not be needed
    width: global.screen_width,
    height: global.screen_height,
  },
  grass: {
    backgroundColor: 'lightgreen',
    height: global.grass_height,
    width: global.screen_width,
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  workspace: {
    //backgroundColor: 'blue',
    height: global.screen_height - global.grass_height,
    width: global.screen_width,
    position: 'absolute',
    left: 0,
    bottom: 100,
  },
});
