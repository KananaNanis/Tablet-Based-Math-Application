// import { combineReducers } from 'redux'
import { combineReducers } from 'redux-immutable';
import { List, Map, fromJS } from 'immutable';

import * as AT from './actionTypes'
import { add_block_to_name, remove_block_from_name } from '../components/Block'

// the following reducers control the various overall chunks of the store

function array_add_remove_element(state, elt, add, skip_duplicate) {
  if (add) {
    if (skip_duplicate && state.indexOf(elt) > -1)
      return state
    else
      /*
      return [
        ...state,
        elt
      ]
      */
      return state.push(elt)
  } else {
    const index = state.indexOf(elt);
    if (index > -1) {
      /*
      let cpy = [...state]
      cpy.splice(index, 1);
      return cpy
      */
      return state.delete(index)
    }
    return state
  }
}

function obj_add_remove_property(state, key, val) {
  if (null === val) {
    if (state.has(key)) {
      /*
      let cpy = { ...state }
      delete cpy[key]
      return cpy
      */
      return state.delete(key)
    } else return state
  } else {
    /*
    return {
      ...state,
      [key]: val,
    }
    */
    return state.set(key, val)
  }
}

function tower_ids(state = List([]), action) {
  switch (action.type) {
    case AT.TOWER_CREATE:
      return array_add_remove_element(state, action.id, true, true)
    case AT.TOWER_DELETE:
      return array_add_remove_element(state, action.id, false, true)
    default:
      return state
  }
}

function tile_ids(state = List([]), action) {
  switch (action.type) {
    case AT.TILE_CREATE:
      return array_add_remove_element(state, action.id, true, true)
    case AT.TILE_DELETE:
      return array_add_remove_element(state, action.id, false, true)
    default:
      return state
  }
}

function door_ids(state = List([]), action) {
  switch (action.type) {
    case AT.DOOR_CREATE:
      return array_add_remove_element(state, action.id, true, true)
    case AT.DOOR_DELETE:
      return array_add_remove_element(state, action.id, false, true)
    default:
      return state
  }
}

function portal_ids(state = List([]), action) {
  switch (action.type) {
    case AT.PORTAL_CREATE:
      return array_add_remove_element(state, action.id, true, true)
    case AT.PORTAL_DELETE:
      return array_add_remove_element(state, action.id, false, true)
    default:
      return state
  }
}

function name(state = Map({}), action) {
  switch (action.type) {
    case AT.TOWER_CREATE:
    case AT.TILE_CREATE:
    case AT.DOOR_CREATE:
    case AT.PORTAL_CREATE:
    case AT.SET_NAME:
      return obj_add_remove_property(state, action.id, action.name);
    case AT.TOWER_DELETE:
    case AT.TILE_DELETE:
    case AT.DOOR_DELETE:
    case AT.PORTAL_DELETE:
      return obj_add_remove_property(state, action.id, null);
    case AT.TOWER_ADD_BLOCK:
      /*
      return {
        ...state,
        [action.id]: add_block_to_name(action.size, action.is_fiver, state[action.id])
      }
      */
      return state.set(action.id,
        add_block_to_name(action.size, action.is_fiver, state.get(action.id)))
    case AT.TOWER_REMOVE_BLOCK:
      /*
      return {
        ...state,
        [action.id]: remove_block_from_name(state[action.id])
      }
      */
      console.error('how?')
      return state.set(action.id,
        remove_block_from_name(state.get(action.id)))
    default:
      return state
  }
}

function position(state = Map({}), action) {
  switch (action.type) {
    case AT.TOWER_CREATE:
    case AT.TILE_CREATE:
    case AT.DOOR_CREATE:
    case AT.PORTAL_CREATE:
    case AT.SET_POSITION:
      return obj_add_remove_property(state, action.id, action.position);
    case AT.TOWER_DELETE:
    case AT.TILE_DELETE:
    case AT.DOOR_DELETE:
    case AT.PORTAL_DELETE:
      return obj_add_remove_property(state, action.id, null);
    default:
      return state
  }
}

function style(state = Map({}), action) {
  let new_style = state.get(action.id) ? state.get(action.id) : Map({})
  switch (action.type) {
    case AT.ADD_OBJ_STYLE:
      new_style = obj_add_remove_property(new_style, action.key, action.value);
      return state.set(action.id, new_style)
    case AT.TOWER_CREATE:
    case AT.TILE_CREATE:
    case AT.DOOR_CREATE:
    case AT.PORTAL_CREATE:
    case AT.TOWER_DELETE:
    case AT.TILE_DELETE:
    case AT.DOOR_DELETE:
    case AT.PORTAL_DELETE:
      return obj_add_remove_property(state, action.id, null);
    default:
      return state
  }
}

function anim_info(state = Map({}), action) {
  switch (action.type) {
    case AT.SET_ANIM_INFO:
      return state.set(action.id, action.anim_info)
    case AT.TOWER_CREATE:
    case AT.TILE_CREATE:
    case AT.DOOR_CREATE:
    case AT.PORTAL_CREATE:
    case AT.TOWER_DELETE:
    case AT.TILE_DELETE:
    case AT.DOOR_DELETE:
    case AT.PORTAL_DELETE:
      //console.log('removing anim_info for id', action.id)
      return obj_add_remove_property(state, action.id, null);
    default:
      return state
  }
}

function tower_style(state = Map({}), action) {
  let new_style = state.get(action.id) ? state.get(action.id) : Map({})
  switch (action.type) {
    case AT.TOWER_SET_WIDTH:
      new_style = obj_add_remove_property(new_style, 'width', action.width);
      //return Object.assign({}, state, { [action.id]: new_style })
      return state.set(action.id, new_style)
    case AT.TOWER_SET_OVERFLOW:
      new_style = obj_add_remove_property(new_style, 'overflow', action.overflow);
      //return Object.assign({}, state, { [action.id]: new_style })
      return state.set(action.id, new_style)
    case AT.TOWER_CREATE:
    case AT.TOWER_DELETE:
      return obj_add_remove_property(state, action.id, null);
    default:
      return state
  }
}

function block_opacity(state = Map({}), action) {
  switch (action.type) {
    case AT.TOWER_SET_BLOCK_OPACITY:
      /*
      let new_opacity = state[action.id] ? state[action.id].slice() : []
      new_opacity[action.index] = action.opacity
      return {
        ...state,
        [action.id]: new_opacity
      }
      */
      const new_opacity = state.has(action.id)
        ? state.get(action.id).set(action.index, action.opacity)
        : List([])
      return state.set(action.id, new_opacity)
    case AT.TOWER_CREATE:
    case AT.TOWER_DELETE:
      return obj_add_remove_property(state, action.id, null);
    default:
      return state
  }
}


function misc(state = Map({}), action) {
  let new_misc = state.get(action.id) ? state.get(action.id) : Map({})
  switch (action.type) {
    case AT.ADD_OBJ_MISC:
      new_misc = obj_add_remove_property(new_misc, action.key, action.value);
      return state.set(action.id, new_misc)
    case AT.TOWER_CREATE:
    case AT.TILE_CREATE:
    case AT.DOOR_CREATE:
    case AT.PORTAL_CREATE:
    case AT.TOWER_DELETE:
    case AT.TILE_DELETE:
    case AT.DOOR_DELETE:
    case AT.PORTAL_DELETE:
      return obj_add_remove_property(state, action.id, null);
    default:
      return state
  }
}

function keypad_kind(state = null, action) {
  switch (action.type) {
    case AT.SET_KEYPAD_KIND:
      return action.kind
    default:
      return state
  }
}

function button_display(state = Map({}), action) {
  switch (action.type) {
    case AT.SET_BUTTON_DISPLAY:
      return obj_add_remove_property(state, action.index, action.val);
    default:
      return state
  }
}

function button_highlight(state = null, action) {
  switch (action.type) {
    case AT.SET_BUTTON_HIGHLIGHT:
      return action.index
    default:
      return state
  }
}

function event_handling(state = Map({}), action) {
  switch (action.type) {
    case AT.CLEAR_EVENT_HANDLING:
      return Map({})
    case AT.SET_EVENT_HANDLING_PARAM:
      return obj_add_remove_property(state, action.key, action.val);
    default:
      return state
  }
}

function err_box(state = '', action) {
  switch (action.type) {
    case AT.SET_ERR_BOX:
      return action.info
    default:
      return state
  }
}

/*
function scale_factor(state = 520, action) {
  switch (action.type) {
    case AT.SET_SCALE_FACTOR:
      return action.val
    default:
      return state
  }
}

function freeze_display(state = null, action) {
  switch (action.type) {
    case AT.SET_FREEZE_DISPLAY:
      return action.t
    default:
      return state
  }
}

function num_stars(state = 0, action) {
  switch (action.type) {
    case AT.SET_NUM_STARS:
      return action.n
    default:
      return state
  }
}

function config_iteration(state = 0, action) {
  switch (action.type) {
    case AT.SET_CONFIG_ITERATION:
      return action.n
    default:
      return state
  }
}

function skip_submit(state = 0, action) {
  switch (action.type) {
    case AT.SET_SKIP_SUBMIT:
      return action.g
    default:
      return state
  }
}

function skip_in_between(state = 0, action) {
  switch (action.type) {
    case AT.SET_SKIP_IN_BETWEEN:
      return action.g
    default:
      return state
  }
}

function goto_iteration(state = 0, action) {
  switch (action.type) {
    case AT.SET_GOTO_ITERATION:
      return action.n
    default:
      return state
  }
}

function center_text(state = '', action) {
  switch (action.type) {
    case AT.SET_CENTER_TEXT:
      return action.text
    default:
      return state
  }
}

function top_right_text(state = '', action) {
  switch (action.type) {
    case AT.SET_TOP_RIGHT_TEXT:
      return action.text
    default:
      return state
  }
}
*/

function prop(state = Map({}), action) {
  switch (action.type) {
    case AT.SET_PROP:
      return state.set(action.key, action.value)
    default:
      return state
  }
}

/*
function config_path(state = List([]), action) {
  switch (action.type) {
    case AT.SET_CONFIG_PATH:
      return action.c
    default:
      return state
  }
}

function prev_config_path(state = List([]), action) {
  switch (action.type) {
    case AT.SET_PREV_CONFIG_PATH:
      return action.c
    default:
      return state
  }
}

function goto_path(state = 0, action) {
  switch (action.type) {
    case AT.SET_GOTO_PATH:
      return action.g
    default:
      return state
  }
}
*/

function path(state = Map({}), action) {
  switch (action.type) {
    case AT.SET_PATH:
      const res = state.set(action.key, action.value)
      //console.log('reducer SET_PATH key', action.key, 'value', action.value, 'res', res.toJS())
      return res
    default:
      return state
  }
}

function log(state = List([]), action) {
  switch (action.type) {
    case AT.ADD_LOG_ENTRY:
      return array_add_remove_element(state, List([action.time, action.info]), true)
    default:
      return state
  }
}

const suujiAppInner = combineReducers({
  // basic geometry
  tower_ids,
  tile_ids,
  door_ids,
  portal_ids,
  name,
  position,
  style,
  anim_info,
  tower_style,
  block_opacity,
  misc,
  keypad_kind,
  button_display,
  button_highlight,

  // other
  event_handling,
  err_box,

  prop,
  /*
  scale_factor,
  freeze_display,
  config_iteration,
  goto_iteration,
  skip_submit,
  skip_in_between,
  center_text,
  top_right_text,
  num_stars,
  */

  path,
  /*
  prev_config_path,
  config_path,
  goto_path,
  */

  log,
})

const initialState = fromJS({
  // general info on towers, tiles, and doors
  tower_ids: [],
  tile_ids: [],
  door_ids: [],
  portal_ids: [],
  /*
  name: {},
  position: {},
  style: { 'door_3': { 'opacity': 0.5 }
  },
  misc: { //'tower_1': { 'role': 'left_operand' },
  },

  // tower info
  tower_style: { // 'tower_1': { 'width': 150, 'overflow': 'hidden' }
  },
  block_opacity: { //'tower_1': [null, 0.5]
  },

  // keypad info
  keypad_kind: null,
  */
  button_display: {},
  /*
  button_highlight: null,
  freeze_display: false,

  // other info
  num_stars: 0,
  //scale_factor: 520,
  //scale_factor : 2,
  */

  /*
  config_path: [],
  config_iteration: 0,
  prev_config_path: [],
  */
  /*
  log: [
    [1533395800000, [['proportion'], 'is_correct', true, .26, .5, .8]],
    [1533395801000, [['proportion'], 'next_config', 'start']],
    [1533395802000, [['proportion'], 'is_correct', true, .36, .5, .8]],
    [1533395803000, [['proportion'], 'is_correct', true, .45, .5, .8]],
  ]
  */
})

function suujiApp(state, action) {
  if (AT.RESET_ALL == action.type) return initialState
  return state ? suujiAppInner(state, action) : initialState
  //return suujiAppInner(state, action)
}

export default suujiApp