import React from 'react'
import { StyleSheet, View } from 'react-native'
import { bindActionCreators } from 'redux'

import WorkspaceContainer from './containers/WorkspaceContainer'
import { global_screen_width, global_screen_height, global_grass_height } from './components/Workspace'
import { touchHandler } from './event/event'
import { global_store } from './index.js'
import Sound from './assets/sound'
import * as Actions from './providers/actions'
import PrintFigure from './components/PrintFigure';
import { query_current_config, query_test } from './providers/query_store';
//import Keypad from './components/Keypad'
//import TowerName from './components/TowerName'
//import Button from './components/Button'

export let doAction = {}
export let global_sound = {}

export function initStoreForCurrentConfig() {
  const cc = query_current_config();
  if ('in_between' == cc) {
    doAction.setButtonDisplay('next', true)
  } else {  // levels that are a variation on copy_tower
    doAction.setKeypadKind('buildTower')
    doAction.setNumStars(3)
    for (const i of [0, 1, 3, 8, 9])
      doAction.setButtonDisplay(i, false)
    doAction.setButtonDisplay('submit', true)
    doAction.setButtonDisplay('delete', true)
    if ('copy_tower' == cc) {
      doAction.towerCreate('t1', [.5, .1], [5, 0])
      doAction.towerCreate('t2', [], [180, 0])
    } else if ('animal_height' == cc) {
      doAction.tileCreate('a1', 'kitty', [-300, 0])
      doAction.towerCreate('t2', [], [180, 0])
    }
  }
  //query_test()
}

export default class App extends React.Component {
  constructor(props) {
    super(props)
    // create the bound action creators!
    doAction = bindActionCreators(Actions, global_store.dispatch)
    //doAction.setScaleFactor(200)
    //doAction.towerSetBlockOpacity('t2', 2, 0.5)
    //doAction.setCurrentConfig('copy_tower')
    //doAction.setCurrentConfig('animal_height')
    doAction.setCurrentConfig('in_between')
    doAction.setCurrentConfigIteration(1)
    initStoreForCurrentConfig();
  }
  componentDidMount() {
    //query_block_positions()
    //console.log(query_tower_blocks('t1', null, true))
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
          {/*
        <Keypad kind="decimal" button_highlight={2} />
        <TowerName id={'t1'} />
        */}
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