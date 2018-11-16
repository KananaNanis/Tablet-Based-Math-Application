import React from 'react'
import NumContainer from '../containers/NumContainer'
import TileContainer from '../containers/TileContainer'
import DoorContainer from '../containers/DoorContainer'
import FiveFrameContainer from '../containers/FiveFrameContainer'
import BarContainer from '../containers/BarContainer'
import {
	query_obj_misc,
	//query_obj_style,
	//query_position_of,
	query_name_of,
} from '../providers/query_store'
//import {height2tower_name} from '../providers/query_tower'

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
		const id = tower_ids.get(i)
		const m = query_obj_misc(id)
		const n = query_name_of(id)
		if ('undefined' === typeof n || null === n) {
			console.error('cannot render Num id', id, 'name', n)
			continue
		}
		let is_option = m ? m.get('is_option') : false
		if (option_values && is_option) {
			// console.log('id', id, 'option', option_values ? option_values.toJS() : null)
			for (let j = 0; j < option_values.size; ++j) {
				let name = option_values.get(nums.length).get(0)
/*
				// this name is not canonical, yet
				name = height2tower_name(name)
*/
				nums.push(
					<NumContainer
						key={id + '_' + j}
						id={id}
						just_grey={just_grey}
						name={name}
						offset_x={offset_x}
					/>,
				)
			}
			// store the name of the object that triggered the construction of options
			nums.push(id)
		} else if (!option_values && !is_option) {
			// console.log('about to render Num id', id, 'name', n)
			nums.push(
				<NumContainer
					key={id}
					id={id}
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
			for (let j = 0; j < option_values.size; ++j) {
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
			// store the name of the object that triggered the construction of options
			doors.push(id)
		} else if (!option_values && !is_option) {
			// console.log('door id', id, 'name', query_name_of(id))
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
		// console.log('portal id', id, 'name', query_name_of(id))
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

export function render_five_frames(five_frame_ids, option_values = null) {
	let ffs = []
	for (let i = 0; i < five_frame_ids.size; ++i) {
		const id = five_frame_ids.get(i)
		const m = query_obj_misc(id)
		// console.log('id', id, 'm', m ? m.toJS() : null)
		let is_option = m ? m.get('is_option') : false
		//let pos = query_position_of(id)
		//let style = query_obj_style(id)
		if (option_values && is_option) {
			// console.log('ff id', id, 'option_values', option_values ? option_values.toJS() : null)
			for (let j = 0; j < option_values.size; ++j) {
				let name = option_values.get(ffs.length).get(0)
				//console.log('five_frame option id', id, 'name', name)
				ffs.push(
					<FiveFrameContainer
						key={id + '_' + j}
						id={id}
						//style={style.toJS()}
						//misc={m.toJS()}
						name={name}
						//position={[pos.get(0), pos.get(1)]}
					/>,
				)
			}
			ffs.push(id)
		} else if (!option_values && !is_option) {
			// console.log('ff id', id, 'name', query_name_of(id))
			//let name = query_name_of(id)
			ffs.push(
				<FiveFrameContainer
					key={id}
					id={id}
					//style={style.toJS()}
					//misc={m.toJS()}
					//name={name}
					//position={[pos.get(0), pos.get(1)]}
				/>,
			)
		}
	}
	return ffs
}

export function render_bars(bar_ids, option_values = null) {
	let bars = []
	for (let i = 0; i < bar_ids.size; ++i) {
		const id = bar_ids.get(i)
		const m = query_obj_misc(id)
		// console.log('id', id, 'm', m ? m.toJS() : null)
		let is_option = m ? m.get('is_option') : false
		//let pos = query_position_of(id)
		//let style = query_obj_style(id)
		if (option_values && is_option) {
			// console.log('ff id', id, 'option_values', option_values ? option_values.toJS() : null)
			for (let j = 0; j < option_values.size; ++j) {
				let name = option_values.get(bars.length).get(0)
				//console.log('five_frame option id', id, 'name', name)
				bars.push(
					<BarContainer
						key={id + '_' + j}
						id={id}
						//style={style.toJS()}
						//misc={m.toJS()}
						name={name}
						//position={[pos.get(0), pos.get(1)]}
					/>,
				)
			}
			// console.log(' adding id', id, 'to end of bars')
			bars.push(id)
		} else if (!option_values && !is_option) {
			// console.log('ff id', id, 'name', query_name_of(id))
			//let name = query_name_of(id)
			bars.push(
				<BarContainer
					key={id}
					id={id}
					//style={style.toJS()}
					//misc={m.toJS()}
					//name={name}
					//position={[pos.get(0), pos.get(1)]}
				/>,
			)
		}
	}
	return bars
}
