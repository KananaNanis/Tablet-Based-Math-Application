import React from 'react';
import { StyleSheet, View } from 'react-native';
/*
import Tower from './components/Tower';
import Num from './components/Num';
import Workspace from './components/Workspace';
import Block from './components/Block';
*/
import WorkspaceContainer from './containers/WorkspaceContainer';
import * as myglobal from './myglobal';
import { touchHandler } from './event/event';

function hi() { console.log('HI');}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    //console.log(Dimensions.get('window').height);
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

/*
export var myglobal = {
  screen_width: Dimensions.get('window').width,
  screen_height: Dimensions.get('window').height,
  grass_height: 101,
  size2value: {'m': .001, 'f': .01, 'z': 0.1, 'u': 1,
               't': 10, 'h': 100, 'p': 1000},
  size2color: {'m': 'limegreen', 'f': 'purple', 'z': 'darkred', 'u': 'blue',
               't': 'green', 'h': 'orange', 'p': 'cyan'},
  size2symbol: {'m': '-', 'f': '^', 'z': 'o', 'u': '|',
               't': '\u25A1', 'h': '\u25EB', 'p': '\u25E7'},
  default_scaleFactor: 520
}
*/

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