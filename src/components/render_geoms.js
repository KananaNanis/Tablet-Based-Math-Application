import React from 'react'
import { Map } from 'immutable'
import Num from './Num'
import Tile from './Tile'
import Door from './Door'

export function add_offset(pos, offset_x=0) { return [pos.get(0) + offset_x, pos.get(1)] }

function my_get(obj, key) {
  const raw = obj.get(key)
  return raw ? raw.toJS() : raw
}

export function render_nums(all_nums, scale_factor, offset_x = 0, just_grey = false) {
  //console.log('render_nums just_grey', just_grey)
  //console.log('render_nums all_nums', all_nums)
  let nums = []
  if (!Map.isMap(all_nums)) return nums
  //for (const id in all_nums)
  all_nums.keySeq().forEach((id) => {
    //console.log('num id ', id)
    const num = all_nums.get(id)
    //console.log('num id ', id, 'anim_info', num.get('anim_info'))
    nums.push(
      <Num id={id}
        name={num.get('name').toJS()}
        position={add_offset(num.get('position'), offset_x)}
        style={my_get(num, 'style')}
        anim_info={my_get(num, 'anim_info')}
        misc={my_get(num, 'misc')}
        tower_style={my_get(num, 'tower_style')}
        block_opacity={my_get(num, 'block_opacity')}
        scale_factor={scale_factor}
        just_grey={just_grey}
        key={id} />
    )
  })
  return nums
}

export function render_tiles(all_tiles, scale_factor, offset_x = 0, just_grey = false) {
  let tiles = []
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
        key={id} />
    )
  })
  return tiles
}

export function render_doors(all_doors, skip, scale_factor, offset_x = 0, just_grey = false) {
  let doors = []
  if (!Map.isMap(all_doors)) return doors
  //console.log('render_doors all_doors ', all_doors.toJS())
  //for (const id in all_doors)
  all_doors.keySeq().forEach((id) => {
    if (id != skip) {
      const door = all_doors.get(id)
      doors.push(
        <Door
          name={door.get('name').toJS()}
          position={add_offset(door.get('position'), offset_x)}
          style={my_get(door, 'style')}
          anim_info={my_get(door, 'anim_info')}
          misc={my_get(door, 'misc')}
          scale_factor={scale_factor}
          just_grey={just_grey}
          id={id}
          key={id} />
      )
    }
  })
  return doors
}

export function render_portals(all_portals, skip, all_nums, all_tiles, all_doors, scale_factor, offset_x = 0, just_grey = false) {
  let portals = []
  if (!Map.isMap(all_portals)) return portals
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
  return portals
}