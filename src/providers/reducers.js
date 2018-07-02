import { combineReducers } from 'redux'
import {
  NUM_CREATE,
  NUM_SET_NAME,
  NUM_SET_POSITION,
  NUM_SET_OPACITY
} from './actions'

function num_IDs(state = [], action) {
  switch (action.type) {
    case NUM_CREATE:
      return [
        ...state,
        action.ID,
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
        [action.ID] : action.name,
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
      if (action.ID in state)
        newPosition = { ...state[action.ID], ...newPosition };
      return {
        ...state,
        [action.ID] : newPosition
      }
    default:
      return state
  }
}

function num_style(state = {}, action) {
  switch (action.type) {
    case NUM_SET_OPACITY:
      let newStyle = { 'opacity' : action.opacity }
      if (action.ID in state)
        newStyle = { ...state[action.ID], ...newStyle }
      return Object.assign({}, state, {
        [action.ID]: newStyle
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
  num_IDs,
  num_name,
  num_position,
  num_style,
  num_misc
})

export default suujiApp
