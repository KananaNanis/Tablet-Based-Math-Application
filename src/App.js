import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
/*
import Block from './views/Block.js';
import Tower from './views/Tower.js';
*/
import Num from './views/Num.js';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    console.log(Dimensions.get('window').height);
  }
  /*
          <Tower id={'t3'} name={['u1', 'z2']}/>
          <Num id={'t1'} name={['u1', 'z2']} position={[100,10]} />
  */
  render() {
    return (
      <View style={styles.root}>
        <View style={styles.grass} />
        <View style={styles.workspace}>
          <Num id={'t1'} name={['u1', 'z2']} position={[11,20]} />
          <Num id={'t2'} name={['u2', 'z1']} position={[200,30]} />
        </View>
      </View>
    );
  }
}

export var myglobal = {
  screen_width: Dimensions.get('window').width,
  screen_height: Dimensions.get('window').height,
  grass_height: 100,
  block_height: {'u':50, 'z':5}
}

const styles = StyleSheet.create({
  root: {
    //backgroundColor: 'white',  // appears to not be needed
    width: myglobal.screen_width,
    height: myglobal.screen_height,
  },
  grass: {
    backgroundColor: 'lightgreen',
    height: myglobal.grass_height,
    width: myglobal.screen_width,
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  workspace: {
    //backgroundColor: 'blue',
    height: myglobal.screen_height - myglobal.grass_height,
    width: myglobal.screen_width,
    position: 'absolute',
    left: 0,
    bottom: 100,
  },
});
