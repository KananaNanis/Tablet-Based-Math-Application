import React from 'react'
import { StyleSheet, View } from 'react-native'
import { bindActionCreators } from 'redux'

import WorkspaceContainer from './containers/WorkspaceContainer'
import { global_screen_width, global_screen_height, global_grass_height } from './components/Workspace'
import { touchHandler } from './event/event'
import { global_store } from './index.js'
import * as Actions from './providers/actions'
//import Button from './components/Button'
//import Keypad from './components/Keypad'
//import TowerName from './components/TowerName'

export let doAction = {}

export default class App extends React.Component {
  constructor(props) {
    super(props)
    // create the bound action creators!
    doAction = bindActionCreators(Actions, global_store.dispatch)
    //doAction.setScaleFactor(200)
    //doAction.numSetBlockOpacity('t2', 2, 0.5)
  }
  componentDidMount() {
    //query_block_positions()
    //console.log(query_tower_blocks('t1', null, true))
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
        {/*
        <Keypad kind="decimal" button_highlight={2} />
        <TowerName id={'t1'} />
        <Button position={[100,100]} width={50} height={50}
            view_style={{backgroundColor:'cyan'}}
            label='button' label_style={{}} />
        */}
      </View>
    )
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