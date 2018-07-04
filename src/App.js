import React from 'react';
import { StyleSheet, View } from 'react-native';
import WorkspaceContainer from './containers/WorkspaceContainer';
import { global_screen_width, global_screen_height, global_grass_height } from './myglobal';
import { touchHandler } from './event/event';
//import { setScaleFactor, numSetBlockOpacity } from './providers/actions';
//import { global_store } from './index.js';
import { query_tower, query_tower_blocks } from './providers/query_store';

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