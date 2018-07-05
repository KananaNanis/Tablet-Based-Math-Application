import React from 'react';
import { StyleSheet, View } from 'react-native';
import WorkspaceContainer from './containers/WorkspaceContainer';
import { global_screen_width, global_screen_height, global_grass_height } from './myglobal';
import { touchHandler } from './event/event';
//import { setScaleFactor, numSetBlockOpacity } from './providers/actions';
//import { global_store } from './index.js';
import { query_tower, query_tower_blocks } from './providers/query_store';
//import Button from './components/Button';
import Keypad from './components/Keypad';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    //console.log(Dimensions.get('window').height);
    //global_store.dispatch(setScaleFactor(200))
    //global_store.dispatch(numSetBlockOpacity('t2', 2, 0.5))
  }
  componentDidMount() {
    //query_block_positions();
    console.log(query_tower_blocks('t1', null, true))
  }
  render() {
    return (
      <View style={styles.root} 
            onStartShouldSetResponder={(evt) => true}
            onMoveShouldSetResponder={(evt) => true}
            onResponderGrant={(evt) => touchHandler(evt, true)}
            onResponderMove={(evt) => touchHandler(evt)}
            onResponderRelease={(evt) => touchHandler(evt)}
            onResponderTerminationRequest={(evt) => false}
        >
        <View style={styles.grass} />
        <WorkspaceContainer style={styles.workspace} />
        <Keypad position={[70,100]} button_width={50} button_height={50}
                space_width={20} space_height={30} />
        {/*
        <Button position={[100,100]} width={50} height={50}
            view_style={{backgroundColor:'cyan'}}
            label='button' label_style={{}} />
        */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    //backgroundColor: 'white',  // appears to not be needed
    width: global_screen_width,
    height: global_screen_height,
  },
  grass: {
    backgroundColor: 'lightgreen',
    height: global_grass_height,
    width: global_screen_width,
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  workspace: {
    //backgroundColor: 'blue',
    height: global_screen_height - global_grass_height,
    width: global_screen_width,
    position: 'absolute',
    left: 0,
    bottom: 100,
  },
});