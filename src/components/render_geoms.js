import React from 'react'
import NumContainer from '../containers/NumContainer'
import TileContainer from '../containers/TileContainer'
import DoorContainer from '../containers/DoorContainer'
import {query_obj_misc, query_name_of_door} from '../providers/query_store'
import {height2tower_name} from '../providers/query_tower'

export function add_offset(pos, offset_x = 0) {
	return [pos.get(0) + offset_x, pos.get(1)]
}

export function render_nums(
	tower_ids,
	offset_x = 0,
	just_grey = false,
	option_values = null,
) {
	//console.log('render_nums just_grey', just_grey)
	let nums = []
	for (let i = 0; i < tower_ids.size; ++i) {
		const m = query_obj_misc(tower_ids.get(i))
		let is_option = m ? m.get('is_option') : false
		if (option_values && is_option) {
			// console.log('id', id, 'option', option_values ? option_values.toJS() : null)
			for (let j = 0; j < 4; ++j) {
				let name = option_values.get(nums.length)
				// this name is not canonical, yet
				name = height2tower_name(name.get(0))
				nums.push(
					<NumContainer
						key={tower_ids.get(i) + '_' + j}
						id={tower_ids.get(i)}
						just_grey={just_grey}
						name={name}
						offset_x={offset_x}
					/>,
				)
			}
		} else if (!option_values && !is_option) {
			nums.push(
				<NumContainer
					key={tower_ids.get(i)}
					id={tower_ids.get(i)}
					just_grey={just_grey}
					offset_x={offset_x}
				/>,
			)
		}
	}
	return nums
}

export function render_tiles(tile_ids, offset_x = 0, just_grey = false) {
	let tiles = []
	for (let i = 0; i < tile_ids.size; ++i) {
		tiles.push(
			<TileContainer
				key={tile_ids.get(i)}
				id={tile_ids.get(i)}
				just_grey={just_grey}
				offset_x={offset_x}
			/>,
		)
	}
	return tiles
}

export function render_doors(
	door_ids,
	skip,
	offset_x = 0,
	just_grey = false,
	option_values = null,
) {
	// console.log('render_doors door_ids', door_ids.toJS(), 'option_values', option_values)
	let doors = []
	for (let i = 0; i < door_ids.size; ++i) {
		const id = door_ids.get(i)
		const m = query_obj_misc(id)
		// console.log('id', id, 'm', m ? m.toJS() : null)
		let is_option = m ? m.get('is_option') : false
		if (skip === id) continue
		if (option_values && is_option) {
			// console.log('id', id, 'option', option_values ? option_values.toJS() : null)
			for (let j = 0; j < 4; ++j) {
				let name = option_values.get(doors.length)
			    // console.log('door option id', id, 'name', name)
				doors.push(
					<DoorContainer
						key={id + '_' + j}
						id={id}
						just_grey={just_grey}
						name={name}
						offset_x={offset_x}
					/>,
				)
			}
		} else if (!option_values && !is_option) {
			// console.log('door id', id, 'name', query_name_of_door(id))
			doors.push(
				<DoorContainer
					key={id}
					id={id}
					just_grey={just_grey}
					offset_x={offset_x}
				/>,
			)
		}
	}
	return doors
}

export function render_portals(
	portal_ids,
	skip,
	tower_ids,
	tile_ids,
	door_ids,
	offset_x = 0,
	just_grey = false,
) {
	//console.log('render_portals door_ids', door_ids)
	let portals = []
	for (let i = 0; i < portal_ids.size; ++i) {
		const id = portal_ids.get(i)
		if (skip === id) continue
		// console.log('portal id', id, 'name', query_name_of_door(id))
		portals.push(
			<DoorContainer
				key={i}
				door_ids={door_ids}
				id={id}
				just_grey={just_grey}
				offset_x={offset_x}
				tile_ids={tile_ids}
				tower_ids={tower_ids}
			/>,
		)
	}
	return portals
}
