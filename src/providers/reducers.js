import { combineReducers } from 'redux'
import * as AT from './actionTypes'
/*
import {
  SET_POSITION,
  SET_OPACITY,
  SET_NAME,
  TOWER_CREATE,
  TOWER_DELETE,
  TOWER_ADD_BLOCK,
  TOWER_REMOVE_BLOCK,
  TOWER_SET_WIDTH,
  TOWER_SET_OVERFLOW,
  TOWER_SET_BLOCK_OPACITY,
  TILE_CREATE,
  TILE_DELETE,
  LIFT_CREATE,
  LIFT_DELETE,
  SET_SCALE_FACTOR,
  SET_KEYPAD_KIND,
  SET_BUTTON_DISPLAY,
  SET_BUTTON_HIGHLIGHT,
  SET_NUM_STARS,
  SET_CURRENT_CONFIG,
  SET_CURRENT_CONFIG_ITERATION,
  SET_PREV_CONFIG,
} from './actionTypes'
*/
import { add_block_to_name, remove_block_from_name } from '../components/Block'

// the following reducers control the various overall chunks of the store

function array_add_remove_element(state, elt, add) {
  if (add) {
    return [
      ...state,
      elt
    ]
  } else {
    const index = state.indexOf(elt);
    if (index > -1) {
      let cpy = [...state]
      cpy.splice(index, 1);
      return cpy
    }
    return state
  }
}

function obj_add_remove_property(state, key, val) {
  if (null === val) {
    if (state.hasOwnProperty(key)) {
      let cpy = { ...state }
      delete cpy[key]
      return cpy
    } else return state
  } else {
    return {
      ...state,
      [key]: val,
    }
  }
}

function tower_ids(state = [], action) {
  switch (action.type) {
    case AT.TOWER_CREATE:
      return array_add_remove_element(state, action.id, true)
    case AT.TOWER_DELETE:
      return array_add_remove_element(state, action.id, false)
    default:
      return state
  }
}

function tile_ids(state = [], action) {
  switch (action.type) {
    case AT.TILE_CREATE:
      return array_add_remove_element(state, action.id, true)
    case AT.TILE_DELETE:
      return array_add_remove_element(state, action.id, false)
    default:
      return state
  }
}

function lift_ids(state = [], action) {
  switch (action.type) {
    case AT.LIFT_CREATE:
      return array_add_remove_element(state, action.id, true)
    case AT.LIFT_DELETE:
      return array_add_remove_element(state, action.id, false)
    default:
      return state
  }
}

function name(state = {}, action) {
  switch (action.type) {
    case AT.TOWER_CREATE:
    case AT.TILE_CREATE:
    case AT.SET_NAME:
      return obj_add_remove_property(state, action.id, action.name);
    case AT.TOWER_DELETE:
    case AT.TILE_DELETE:
      return obj_add_remove_property(state, action.id, null);
    case AT.TOWER_ADD_BLOCK:
      return {
        ...state,
        [action.id]: add_block_to_name(action.size, action.is_fiver, state[action.id])
      }
    case AT.TOWER_REMOVE_BLOCK:
      return {
        ...state,
        [action.id]: remove_block_from_name(state[action.id])
      }
    default:
      return state
  }
}

function position(state = {}, action) {
  switch (action.type) {
    case AT.TOWER_CREATE:
    case AT.TILE_CREATE:
    case AT.SET_POSITION:
      return obj_add_remove_property(state, action.id, action.position);
    case AT.TOWER_DELETE:
    case AT.TILE_DELETE:
      return obj_add_remove_property(state, action.id, null);
    default:
      return state
  }
}

function style(state = {}, action) {
  let new_style = state[action.id] ? state[action.id] : {}
  switch (action.type) {
    case AT.SET_OPACITY:
      new_style = obj_add_remove_property(new_style, 'opacity', action.opacity);
      return Object.assign({}, state, {[action.id] : new_style})
    case AT.TOWER_DELETE:
    case AT.TILE_DELETE:
      return obj_add_remove_property(state, action.id, null);
    default:
      return state
  }
}

function tower_style(state = {}, action) {
  let new_style = state[action.id] ? state[action.id] : {}
  switch (action.type) {
    case AT.TOWER_SET_WIDTH:
      new_style = obj_add_remove_property(new_style, 'width', action.width);
      return Object.assign({}, state, {[action.id] : new_style})
    case AT.TOWER_SET_OVERFLOW:
      new_style = obj_add_remove_property(new_style, 'overflow', action.overflow);
      return Object.assign({}, state, {[action.id] : new_style})
    case AT.TOWER_DELETE:
      return obj_add_remove_property(state, action.id, null);
    default:
      return state
  }
}

function block_opacity(state = {}, action) {
  switch (action.type) {
    case AT.TOWER_SET_BLOCK_OPACITY:
      let new_opacity = state[action.id] ? state[action.id].slice() : []
      new_opacity[action.index] = action.opacity
      return {
        ...state,
        [action.id]: new_opacity
      }
    case AT.TOWER_DELETE:
      return obj_add_remove_property(state, action.id, null);
    default:
      return state
  }
}


function misc(state = {}, action) {
  switch (action.type) {
    default:
      return state
  }
}

function scale_factor(state = 520, action) {
  switch (action.type) {
    case AT.SET_SCALE_FACTOR:
      return action.val
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

function button_display(state = null, action) {
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

function num_stars(state = 3, action) {
  switch (action.type) {
    case AT.SET_NUM_STARS:
      return action.n
    default:
      return state
  }
}

function current_config(state = null, action) {
  switch (action.type) {
    case AT.SET_CURRENT_CONFIG:
      return action.c
    default:
      return state
  }
}

function current_config_iteration(state = 0, action) {
  switch (action.type) {
    case AT.SET_CURRENT_CONFIG_ITERATION:
      return action.n
    default:
      return state
  }
}

function prev_config(state = null, action) {
  switch (action.type) {
    case AT.SET_PREV_CONFIG:
      return action.c
    default:
      return state
  }
}

const suujiAppInner = combineReducers({
  tower_ids,
  tile_ids,
  lift_ids,
  name,
  position,
  style,
  tower_style,
  block_opacity,
  misc,
  scale_factor,
  keypad_kind,
  button_display,
  button_highlight,
  num_stars,
  current_config,
  current_config_iteration,
  prev_config,
})

const initialState = {
  // general info on towers, tiles, and lifts
  tower_ids: [],
  tile_ids: [],
  lift_ids: [],
  name: {},
  position: {},
  style: { //'t2': { 'opacity': 0.5 }
  },
  misc: { //'t1': { 'role': 'left_operand' },
  },

  // tower info
  tower_style: { // 't1': { 'width': 150, 'overflow': 'hidden' }
  },
  block_opacity: { //'t1': [null, 0.5]
  },

  // keypad info
  keypad_kind: null,
  button_display: {},
  button_highlight: null,

  // other info
  num_stars: 0,
  scale_factor: 520,
  //scale_factor : 2,

  current_config: null,
  current_config_iteration: 0,
  prev_config: null,
}

function suujiApp(state, action) {
  return state ? suujiAppInner(state, action) : initialState
}

export default suujiApp