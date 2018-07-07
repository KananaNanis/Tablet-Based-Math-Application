import { combineReducers } from 'redux'
import {
  NUM_CREATE,
  NUM_SET_NAME,
  NUM_ADD_BLOCK,
  NUM_REMOVE_BLOCK,
  NUM_SET_POSITION,
  NUM_SET_OPACITY,
  NUM_SET_TOWER_WIDTH,
  NUM_SET_TOWER_OVERFLOW,
  NUM_SET_BLOCK_OPACITY,
  SET_SCALE_FACTOR,
  SET_KEYPAD_KIND,
  SET_BUTTON_HIGHLIGHT
} from './actionTypes'
import { add_block_to_name, remove_block_from_name } from '../components/Block'

// the following reducers control the various overall chunks of the store

function num_ids(state = [], action) {
  switch (action.type) {
    case NUM_CREATE:
      return [
        ...state,
        action.id,
      ]
    default:
      return state
  }
}

function num_name(state = {}, action) {
  switch (action.type) {
    case NUM_CREATE:
    case NUM_SET_NAME:
      return {
        ...state,
        [action.id]: action.name,
      }
    case NUM_ADD_BLOCK:
      return {
        ...state,
        [action.id]: add_block_to_name(action.size, action.is_fiver, state[action.id])
      }
    case NUM_REMOVE_BLOCK:
      return {
        ...state,
        [action.id]: remove_block_from_name(state[action.id])
      }
    default:
      return state
  }
}

function num_position(state = {}, action) {
  switch (action.type) {
    case NUM_CREATE:
    case NUM_SET_POSITION:
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

function num_style(state = {}, action) {
  switch (action.type) {
    case NUM_SET_OPACITY:
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

function num_tower_style(state = {}, action) {
  let newStyle = {}
  switch (action.type) {
    case NUM_SET_TOWER_WIDTH:
      newStyle = { 'width': action.width }
      if (action.id in state)
        newStyle = { ...state[action.id], ...newStyle }
      return Object.assign({}, state, {
        [action.id]: newStyle
      })
    case NUM_SET_TOWER_OVERFLOW:
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

function num_block_opacity(state = {}, action) {
  switch (action.type) {
    case NUM_SET_BLOCK_OPACITY:
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


function num_misc(state = {}, action) {
  switch (action.type) {
    default:
      return state
  }
}

function scale_factor(state = 520, action) {
  switch (action.type) {
    case SET_SCALE_FACTOR:
      return action.val
    default:
      return state
  }
}

function keypad_kind(state = 'decimal', action) {
  switch (action.type) {
    case SET_KEYPAD_KIND:
      return action.kind
    default:
      return state
  }
}

function button_highlight(state = null, action) {
  switch (action.type) {
    case SET_BUTTON_HIGHLIGHT:
      return action.index
    default:
      return state
  }
}

const suujiAppInner = combineReducers({
  num_ids,
  num_name,
  num_position,
  num_style,
  num_tower_style,
  num_block_opacity,
  num_misc,
  scale_factor,
  keypad_kind,
  button_highlight
})

const initialState = {
  num_ids: ['t1', 't2'],
  num_name: {
    //'t1' : [1, .1, .05, .01],
    't1': [.5, .2, .05, .05, .04],
    //'t1' : [100, 50, 50, 10, 5, 5, 4],
    't2': []
  },
  num_position: {
    't1': [5, 0],
    't2': [180, 0]
  },
  num_style: { 't2': { 'opacity': 0.5 } },
  num_tower_style: { 't1': { 'width': 150, 'overflow': 'hidden' } },
  num_block_opacity: { 't1': [null, 0.5] },
  num_misc: {
    't1': { 'role': 'left_operand' },
    't2': {}
  },
  scale_factor: 520,
  //scale_factor : 2,
  keypad_kind: 'buildTower',
  button_highlight: null,
}

function suujiApp(state, action) {
  return state ? suujiAppInner(state, action) : initialState
}

export default suujiApp
