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

function handle_create_delete(state = [], action) {
  switch (action.type) {
    case AT.TOWER_CREATE:
    case AT.TILE_CREATE:
    case AT.LIFT_CREATE:
      return [
        ...state,
        action.id,
      ]
    case AT.TOWER_DELETE:
    case AT.TILE_DELETE:
    case AT.LIFT_DELETE:
      const index = state.indexOf(action.id);
      if (index > -1) {
        let cpy = [...state]
        cpy.splice(index, 1);
        return cpy
      }
    default:
      return state
  }
}

function tower_ids(state = [], action) {
  //console.log('tower_ids', state, action)
  if (action.type == AT.TOWER_CREATE ||
    action.type == AT.TOWER_DELETE) {
    return handle_create_delete(state, action)
  } else return state;
}

function tile_ids(state = [], action) {
  if (action.type == AT.TILE_CREATE ||
    action.type == AT.TILE_DELETE)
    return handle_create_delete(state, action)
  else return state;
}

function lift_ids(state = [], action) {
  if (action.type == AT.LIFT_CREATE ||
    action.type == AT.LIFT_DELETE)
    return handle_create_delete(state, action)
  else return state;
}

function name(state = {}, action) {
  switch (action.type) {
    case AT.TOWER_CREATE:
    case AT.TILE_CREATE:
    case AT.SET_NAME:
      return {
        ...state,
        [action.id]: action.name,
      }
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
      let newPosition = [action.position[0] || 0,
      action.position[1] || 0]
      return {
        ...state,
        [action.id]: newPosition
      }
    default:
      return state
  }
}

function style(state = {}, action) {
  switch (action.type) {
    case AT.SET_OPACITY:
      let newStyle = { 'opacity': action.opacity }
      if (action.id in state)
        newStyle = { ...state[action.id], ...newStyle }
      return Object.assign({}, state, {
        [action.id]: newStyle
      })
    default:
      return state
  }
}

function tower_style(state = {}, action) {
  let newStyle = {}
  switch (action.type) {
    case AT.TOWER_SET_WIDTH:
      newStyle = { 'width': action.width }
      if (action.id in state)
        newStyle = { ...state[action.id], ...newStyle }
      return Object.assign({}, state, {
        [action.id]: newStyle
      })
    case AT.TOWER_SET_OVERFLOW:
      newStyle = { 'overflow': action.overflow }
      if (action.id in state)
        newStyle = { ...state[action.id], ...newStyle }
      return Object.assign({}, state, {
        [action.id]: newStyle
      })
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
      if (null === action.val) {  // remove id
        if (state.hasOwnProperty(action.index)) {
          let cpy = {...state}
          delete cpy[action.index]
          return cpy
        }
      } else return { ...state, [action.index]: action.val }
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