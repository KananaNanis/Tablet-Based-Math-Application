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
import { enter_exit_config, as_position } from './providers/change_config'
import { query_config_path } from './providers/query_store';
import { get_keypad_width_height } from './components/Keypad';

export let doAction = {}
export let global_sound = {}

let prev_response_text = ''
export let config_tree = {}
export let global_constant = false

function convert_unicode(input) {
  return input.replace(/\\u(\w\w\w\w)/g, function (a, b) {
    var charcode = parseInt(b, 16);
    return String.fromCharCode(charcode);
  });
}

function update_constant_position_info() {
  const p = global_constant.placard
  p.position = as_position(p.position, p.width, p.height)
  for (const item of ['special_button_geoms', 'keypad_info']) {
    for (const key in global_constant[item]) {
      let geom = global_constant[item][key], width, height
      if ('keypad_info' == item) {
        const g = get_keypad_width_height(key)
        width = g.width
        height = g.height
      } else {
        width = geom.width
        height = geom.height
      }
      var pos = as_position(geom.position, width, height)
      //console.log(key, geom.position, pos)
      global_constant[item][key].position = pos
    }
  }
}

export async function load_config_tree() {
  try {
    if (!global_constant) {  // first load the constants
      let const_buffer = await fetch('assets/constant.yaml');
      let const_text = await const_buffer.text();
      const_text = convert_unicode(const_text)
      global_constant = yaml.safeLoad(const_text);
      update_constant_position_info()
      if ('undefined' === typeof user_id)  // for testing
        global_constant.username = 'Olaf'
      else
        global_constant.username = global_constant.first_name_of[user_id]
    }
    let response = await fetch('assets/config.yaml');
    let response_text = await response.text();
    if (response_text == prev_response_text) return
    prev_response_text = response_text
    //console.log(response_text);
    config_tree = yaml.safeLoad(response_text);
    console.log('config_tree', config_tree);

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
    //let path = first_config_path()
    const path = config_tree.params.starting_config_path
    // clear the store
    doAction.resetAll()

    doAction.setConfigPath(path)
    doAction.setPrevConfigPath(query_config_path())
    doAction.setScaleFactor(global_constant.scale_factor_from_yaml)
    //get_config(path)

    //doAction.setCurrentConfig('animal_height')
    //doAction.setCurrentConfig('in_between')
    enter_exit_config(true, true);
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
    //load_config_tree()
    // poll to see if the tree has changed
    window.setInterval(load_config_tree, 1000)
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