import React from 'react'
import { StyleSheet, View } from 'react-native'
import { bindActionCreators } from 'redux'
import yaml from 'js-yaml'

import WorkspaceContainer from './containers/WorkspaceContainer'
import { global_screen_width, global_screen_height, global_grass_height } from './components/Workspace'
import { touchHandler } from './event/event'
import { global_store } from './index.js'
import Sound from './assets/sound'
import * as Actions from './providers/actions'
import PrintFigure from './components/PrintFigure';
import { enter_exit_config, get_config, first_config_path, next_config_path } from './providers/change_config'
import { query_config_path } from './providers/query_store';

export let doAction = {}
export let global_sound = {}

export let config_tree = {}
async function load_config_tree() {
  try {
    let response = await fetch('assets/config.yaml');
    let responseText = await response.text();
    //console.log(responseText);
    config_tree = yaml.safeLoad(responseText);
    //console.log('config_tree', config_tree);

    // create the bound action creators!
    if (0) { // verbose version
      doActionInner = bindActionCreators(Actions, global_store.dispatch)
      for (const a in doActionInner) {
        doAction[a] = function (...args) {
          console.log(a, ...args)
          return doActionInner[a](...args)
        }
      }
    } else doAction = bindActionCreators(Actions, global_store.dispatch)

    //let path = ['in_between']
    //let path = ['measure_height', 'animal_height', 'level_1']
    //let path = ['measure_height', 'copy_tower', 'level_1']
    let path = first_config_path()
    doAction.setConfigPath(path)
    doAction.setPrevConfigPath(query_config_path())
    //get_config(path)

    //doAction.setCurrentConfig('animal_height')
    //doAction.setCurrentConfig('in_between')
    enter_exit_config(true);
  } catch (error) {
    console.error(error);
  }
}

/*
export default App = (props) => {
  load_config_tree();
  return null
}
*/

export default class App extends React.Component {
  constructor(props) {
    super(props)
    load_config_tree();
  }
  componentDidMount() {
    //query_block_positions()
    //console.log(query_tower_blocks('tower_1', null, true))
    // preload some sounds?
    const available_sounds = ['chirp1',
      'chirp2', 'bells', 'level0', 'level1', 'level2', 'level3']
    for (const snd of available_sounds)
      global_sound[snd] = new Sound('assets/snd/' + snd + '.wav')
    global_sound['chirp1'] = new Sound('assets/snd/chirp1.wav')
  }
  render() {
    if (0) {
      return <PrintFigure />
    } else {
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
      )
    }
  }
}

const styles = StyleSheet.create({
  root: {
    width: global_screen_width,
    height: global_screen_height
  },
  grass: {
    backgroundColor: 'lightgreen',
    height: global_grass_height,
    width: global_screen_width,
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
})