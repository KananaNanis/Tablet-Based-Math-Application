import React from 'react';
import { StyleSheet, View } from 'react-native';
/*
import Tower from './components/Tower';
import Num from './components/Num';
import Workspace from './components/Workspace';
import Block from './components/Block';
*/
import WorkspaceContainer from './containers/WorkspaceContainer';
import { global_screen_width, global_screen_height, global_grass_height } from './myglobal';
import { touchHandler } from './event/event';
//import { setScaleFactor, numSetBlockOpacity } from './providers/actions';
//import { global_store } from './index.js';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    //console.log(Dimensions.get('window').height);
    //global_store.dispatch(setScaleFactor(200))
    //global_store.dispatch(numSetBlockOpacity('t2', 2, 0.5))
  }
  /*
        <Block size={'u'} scaleFactor={200} bottom={100} />
        <Block size={'U'} scaleFactor={200} bottom={100} />
        <Block size={'m'} scaleFactor={200000} bottom={100} />
          <Tower id={'t3'} name={['u1', 'z2']}/>
          <Num id={'t1'} name={['u1', 'z2']} position={[11, 20]} />
        <Workspace style={styles.workspace}
                   num_desc={[{id:'t1', name:['u1', 'z2'], position:[11,12]},
                              {id:'t2', name:['u2', 'z1'], position:[200,30]}]} />
  */
  render() {
    return (
      <View style={styles.root} 
            onStartShouldSetResponder={(evt) => true}
            onMoveShouldSetResponder={(evt) => true}
            onResponderGrant={(evt) => touchHandler(evt, true)}
            onResponderMove={(evt) => touchHandler(evt)}
            onResponderRelease={(evt) => touchHandler(evt)}
            onResponderTerminationRequest={(evt) => false}
      /*
            onTouchStart={touchHandler}
            onTouchMove={touchHandler}
            onTouchEnd={touchHandler}
            mouseDown={mouseHandler}
            mouseMove={mouseHandler}
            mouseUp={mouseHandler}
            onTouchCancel={touchHandler}>
            onClick={this._onClick}
            */
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