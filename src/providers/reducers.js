import { combineReducers } from 'redux'
import {
  NUM_CREATE,
  NUM_SET_NAME,
  NUM_SET_POSITION,
  NUM_SET_OPACITY
} from './actions'

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
        [action.id] : action.name,
      }
    default:
      return state
  }
}

function num_position(state = {}, action) {
  switch (action.type) {
    case NUM_CREATE:
    case NUM_SET_POSITION:
      let newPosition = {'left' : action.left || 0, 
                         'bottom' : action.bottom || 0};
      if (action.id in state)
        newPosition = { ...state[action.id], ...newPosition };
      return {
        ...state,
        [action.id] : newPosition
      }
    default:
      return state
  }
}

function num_style(state = {}, action) {
  switch (action.type) {
    case NUM_SET_OPACITY:
      let newStyle = { 'opacity' : action.opacity }
      if (action.id in state)
        newStyle = { ...state[action.id], ...newStyle }
      return Object.assign({}, state, {
        [action.id]: newStyle
      })
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

const suujiApp = combineReducers({
  num_ids,
  num_name,
  num_position,
  num_style,
  num_misc
})

export default suujiApp
