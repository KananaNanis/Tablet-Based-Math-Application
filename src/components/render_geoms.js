import React from 'react'
import { Map } from 'immutable'
import Num from './Num'
import NumContainer from '../containers/NumContainer'
//import Tile from './Tile'
import TileContainer from '../containers/TileContainer'
import Door from './Door'
import DoorContainer from '../containers/DoorContainer'
import { query_obj_misc, query_prop } from '../providers/query_store'
import { height2tower_name } from '../providers/query_tower'

export function add_offset(pos, offset_x=0) {
  return [pos.get(0) + offset_x, pos.get(1)]
}

function my_get(obj, key) {
  const raw = obj.get(key)
  return raw ? raw.toJS() : raw
}

/*
function numAsJSX(name, num, id, scale_factor, offset_x, just_grey, is_option) {
  let misc = my_get(num, 'misc')
  if (is_option) {
    misc.is_option = true
    //console.log('name', name, 'pos', add_offset(num.get('position'), offset_x))
  }
  return (
      <Num id={id}
        name={name}
        position={add_offset(num.get('position'), offset_x)}
        style={my_get(num, 'style')}
        anim_info={my_get(num, 'anim_info')}
        misc={misc}
        tower_style={my_get(num, 'tower_style')}
        block_opacity={my_get(num, 'block_opacity')}
        scale_factor={scale_factor}
        just_grey={just_grey}
        key={id} />
  )
}
*/

export function render_nums(tower_ids, offset_x = 0, just_grey = false, option_values=null) {
  //console.log('render_nums just_grey', just_grey)
  let nums = []
  for (const i = 0; i < tower_ids.size; ++i) {
    const m = query_obj_misc(tower_ids.get(i))
    let is_option = m ? m.get('is_option') : false
    if (option_values && is_option) {
      // console.log('id', id, 'option', option_values ? option_values.toJS() : null)
      for (const j = 0; j < 4; ++j) {
        let name = option_values.get(nums.length).toJS()
        // this name is not canonical, yet
        name = height2tower_name(name[0])
        nums.push(<NumContainer id={tower_ids.get(i)} name={name} offset_x={offset_x} just_grey={just_grey} key={tower_ids.get(i) + '_' + j} />)
      }
    } else if (!option_values && !is_option) {
      nums.push(<NumContainer id={tower_ids.get(i)} offset_x={offset_x} just_grey={just_grey} key={tower_ids.get(i)} />)
    }
  }
/*
  if (!Map.isMap(all_nums)) return nums
  //for (const id in all_nums)
  all_nums.keySeq().forEach((id) => {
    //console.log('num id ', id)
    const num = all_nums.get(id)
      if (option_values && num.getIn(['misc', 'is_option'])) {
        // console.log('id', id, 'option', option_values ? option_values.toJS() : null)
        for (const i = 0; i < 4; ++i) {
          let name = option_values.get(nums.length).toJS()
          // this name is not canonical, yet
          name = height2tower_name(name[0])
          nums.push(numAsJSX(name, num, id, scale_factor,offset_x,just_grey,true))
        }
      } else if (!option_values && !num.getIn(['misc', 'is_option'])) {
        //console.log('name', num.get('name'))
        const name = num.get('name') ? num.get('name').toJS() : [0]
        //console.log('num id ', id, 'anim_info', num.get('anim_info'))
        nums.push(
          numAsJSX(name, num, id, scale_factor, offset_x, just_grey)
        )
      }
  })
*/
  return nums
}

export function render_tiles(tile_ids, offset_x = 0, just_grey = false) {
  let tiles = []
  for (const i = 0; i < tile_ids.size; ++i)
    tiles.push(<TileContainer id={tile_ids.get(i)} offset_x={offset_x} just_grey={just_grey} key={tile_ids.get(i)} />)
  return tiles
}
/*
  if (!Map.isMap(all_tiles)) return tiles
  //console.log('render_tiles all_tiles ', all_tiles)
  //for (const id in all_tiles)
  all_tiles.keySeq().forEach((id) => {
    const tile = all_tiles.get(id)
    tiles.push(
      <Tile
        name={tile.get('name')}
        position={add_offset(tile.get('position'), offset_x)}
        style={my_get(tile, 'style')}
        anim_info={my_get(tile, 'anim_info')}
        misc={my_get(tile, 'misc')}
        scale_factor={scale_factor}
        just_grey={just_grey}
        id={id}
        key={id} />
    )
  })
*/

/*
function doorAsJSX(name, door, id, scale_factor, offset_x, just_grey, is_option) {
  let misc = my_get(door, 'misc')
  if (is_option) {
    misc.is_option = true
  }
  return (
          <Door
            name={name}
            position={add_offset(door.get('position'), offset_x)}
            style={my_get(door, 'style')}
            anim_info={my_get(door, 'anim_info')}
            misc={misc}
            scale_factor={scale_factor}
            just_grey={just_grey}
            id={id}
            key={id} />
        )
}
*/

export function render_doors(door_ids, skip, offset_x = 0, just_grey = false, option_values = null) {
  // console.log('render_doors door_ids', door_ids.toJS(), 'option_values', option_values)
  let doors = []
  for (const i = 0; i < door_ids.size; ++i) {
    const id = door_ids.get(i)
    const m = query_obj_misc(id)
    // console.log('id', id, 'm', m ? m.toJS() : null)
    let is_option = m ? m.get('is_option') : false
    if (skip == id) continue
    if (option_values && is_option) {
      // console.log('id', id, 'option', option_values ? option_values.toJS() : null)
      for (const j = 0; j < 4; ++j) {
        let name = option_values.get(doors.length).toJS()
        doors.push(<DoorContainer id={id} name={name} offset_x={offset_x} just_grey={just_grey} key={id + '_' + j} />)
      }
    } else if (!option_values && !is_option) {
      // console.log('id', id)
      doors.push(<DoorContainer id={id} offset_x={offset_x} just_grey={just_grey} key={id} />)
    }
  }
/*
  if (!Map.isMap(all_doors)) return doors
  all_doors.keySeq().forEach((id) => {
    if (id != skip) {
      const door = all_doors.get(id)
      if (option_values && door.getIn(['misc', 'is_option'])) {
        //console.log('id', id, 'option', option_values ? option_values.toJS() : null)
        //console.log('id', id, 'misc', my_get(door, 'misc'))
        // const name = option_values ? option_values[doors.length] : door.get('name').toJS()
        for (const i = 0; i < 4; ++i) {
          const name = option_values.get(doors.length).toJS()
          doors.push(doorAsJSX(name, door, id, scale_factor,offset_x,just_grey,true))
        }
      } else if (!option_values && !door.getIn(['misc', 'is_option'])) {
        const name = door.get('name').toJS()
        doors.push(doorAsJSX(name, door, id, scale_factor, offset_x, just_grey))
      }
    }
  })
*/
  return doors
}

export function render_portals(portal_ids, skip, tower_ids, tile_ids, door_ids, offset_x = 0, just_grey = false)
//export function render_portals(all_portals, skip, tower_ids, tile_ids, door_ids, all_nums, all_tiles, all_doors, offset_x = 0, just_grey = false)
{
  //console.log('render_portals door_ids', door_ids)
  let portals = []
  for (const i = 0; i < door_ids.size; ++i) {
    const id = portal_ids.get(i)
    if (skip == id) continue
    portals.push(<DoorContainer id={id} tower_ids={tower_ids} tile_ids={tile_ids} door_ids={door_ids} offset_x={offset_x} just_grey={just_grey} key={id} />)
  }
/*
  if (!Map.isMap(all_portals)) return portals
  const scale_factor = query_prop('scale_factor')
  //for (const id in all_portals)
  all_portals.keySeq().forEach((id) => {
    if (id != skip) {
      const portal = all_portals.get(id)
      portals.push(
        <Door
          name={portal.get('name').toJS()}
          position={add_offset(portal.get('position'), offset_x)}
          style={my_get(portal, 'style')}
          anim_info={my_get(portal, 'anim_info')}
          misc={my_get(portal, 'misc')}
          scale_factor={scale_factor}
          tower_ids={tower_ids}
          tile_ids={tile_ids}
          door_ids={door_ids}
          all_nums={all_nums}
          all_tiles={all_tiles}
          all_doors={all_doors}
          all_portals={all_portals}
          just_grey={just_grey}
          id={id}
          key={id} />
      )
    }
  })
*/
  return portals
}
