import React from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'
import { fromJS } from 'immutable'
import { image_location } from '../App'
import { query_tower_name } from '../providers/query_tower'
import { query_prop } from '../providers/query_store';

export function get_block_size_from_group(group) {
	return 0 + Math.ceil(-1 + 0.00001 + Math.log(group) / Math.log(10))
}

export function get_how_many_from_group(group) {
	let n = Math.round(group / 10 ** get_block_size_from_group(group))
	if (n > 5) n -= 5
	return n
}

export function get_is_fiver_from_group(group) {
	const n = Math.round(group / 10 ** get_block_size_from_group(group))
	return n >= 5 ? 1 : 0
}

export function make_group_from(size, is_fiver) {
	const group = (is_fiver ? 5 : 1) * (10 ** size)
	return group
}

export function condense_groups_of(name) {
	let res = [], prev_size, prev_is_fiver, num_skipped = 0
	for (let i = 0; i < name.length; ++i) {
		const size = get_block_size_from_group(name[i])
		const is_fiver = get_is_fiver_from_group(name[i])
		const how_many = get_how_many_from_group(name[i])
		if (how_many !== 1 && how_many !== 5) {
			console.error('Error in condense_groups_of:  does not handle values other than singletons and fivers!')
		}
		if (i + 1 < name.length) {
			const next_size = get_block_size_from_group(name[i + 1])
			const next_is_fiver = get_is_fiver_from_group(name[i + 1])
			if (!is_fiver && size === next_size) {  // condense these
				++num_skipped
				if (num_skipped === 4) {  // too many!
					res.push(num_skipped * name[i])
					num_skipped = 0
				}
			} else {
				res.push((num_skipped + 1) * name[i])
				num_skipped = 0
			}
		} else {
			res.push((num_skipped + 1) * name[i])
			num_skipped = 0
		}
		// prev_size = size
		// prev_is_fiver = is_fiver
	}
	return res
}

export function get_fiver_incomplete_from_group(group) {
	const n = Math.round(group / 10 ** get_block_size_from_group(group))
	return n > 5
}

export function remove_block_from_name(name0) {
	//console.log('remove_block_from_name', name0)
	//let name = name0.slice()
	let name = name0.toJS()
	if (0 === name.length) return name
	let group = name.pop()
	let size = get_block_size_from_group(group)
	let how_many = get_how_many_from_group(group)
	let is_fiver = get_is_fiver_from_group(group)
	if (how_many > 1 && !is_fiver) {
		// the following special case is due to the convention for handling
		//   fivers using the quantity in the tower name
		if (is_fiver) name.push((5 + how_many - 1) * 10 ** size)
		else name.push((how_many - 1) * 10 ** size)
	}
	return fromJS(name)
}

export function name_is_in_standard_form(name0, allow_non_standard) {
	let res = true
	let name = name0.toJS()
	let reason = ''
	for (let i = 0; i < name.length; ++i) {
		let group1 = name[i]
		let how_many1 = get_how_many_from_group(group1)
		let is_fiver1 = get_is_fiver_from_group(group1)
		if (!is_fiver1 && how_many1 > 4) {
			if (!allow_non_standard) {
				res = false
				reason = 'more than 4'
				break
			}
		}
		if (0 === i) continue
		//console.log('i is now', i)
		let group0 = name[i - 1]
		let size0 = get_block_size_from_group(group0)
		let size1 = get_block_size_from_group(group1)
		if (size0 < size1) {
			res = false
			reason = 'size increase'
			break
		}
		if (size0 === size1) {
			let is_fiver0 = get_is_fiver_from_group(group0)
			if (allow_non_standard &&
           ((is_fiver0 && is_fiver1) || (!is_fiver0 && !is_fiver1))) {  // allow this
			} else if (!is_fiver0 || is_fiver1) {
				// console.log('group01', group0, group1, 'is_fiver01', is_fiver0, is_fiver1)
				res = false
				reason = 'fiverness'
				break
			}
		}
	}
	reason
	//console.log('name_is_in_standard_form name', name, 'res', res, 'reason', reason)
	return res
}

export function is_standard_tower(tgt, allow_non_standard) {
	return name_is_in_standard_form(query_tower_name(tgt), allow_non_standard)
}

export function add_block_to_name(new_size, new_is_fiver, name0) {
	let new_group = (new_is_fiver ? 5 : 1) * 10 ** new_size
	//let name = name0.slice()
	if (0 === name0.length) return [new_group]
	let name = name0.toJS()
	let group = name[name.length - 1]
	let size = get_block_size_from_group(group)
	let how_many = get_how_many_from_group(group)
	let is_fiver = get_is_fiver_from_group(group)
	// console.log('size', size, new_size, 'is_fiver', is_fiver, new_is_fiver, 'how_many', how_many)
	if (size !== new_size || new_is_fiver !== is_fiver || 5 === how_many) {
		name.push(new_group)
	} else {
		// same size and is_fiver, with less than 5
		if (is_fiver) {
			const extra = how_many < 4 ? 5 : 0
			name[name.length - 1] = (how_many + 1 + extra) * 10 ** size
		} else {
			if (how_many < 4) name[name.length - 1] = (how_many + 1) * 10 ** size
			else name.push(new_group)
		}
	}
	//console.log('add_block_to_name new_size', new_size, 'new_is_fiver', new_is_fiver, 'name0', name0.toJS(), 'res', name)
	return fromJS(name)
}

const Block = ({
	width,
	height,
	radius_style,
	img_name,
	view_style,
	text_style,
	text_content,
	just_grey,
	scale_factor,
}) => {
	// console.log('Block img_name', img_name, 'view_style', view_style, 'radius_style', radius_style, 'just_grey', just_grey)
	if ('outline' === just_grey) {
		return (
			<View
				style={[
					styles.block,
					view_style,
					radius_style,
					{
						width,
						height,
					},
				]}
			/>
		)
	}
	let img = null
	if ('diagram' === img_name) {
		// make a tower diagram
	} else if (img_name) {
		img = (
			<Image
				source={image_location(img_name, just_grey)}
				style={[styles.image_default, radius_style, { width, height }]}
			/>
		)
	}
	let txt = null
	if ('|' === text_content) {
		txt = <View style={[styles.vert_bar,
		{
			left: scale_factor/17,
			width: scale_factor/52,
			height: scale_factor*.98,
		}]} />
	} else {
		txt = <Text style={text_style}>{text_content}</Text>
	}

	return (
		<View style={[view_style, radius_style, { width, height }]}>
			{img}
			{txt}
		</View>
	)
}

const none = 'none'
const black = 'black'
const blue = 'blue'
const styles = StyleSheet.create({
	image_default: {
		position: 'absolute',
	},
	block: {
		backgroundColor: blue,
		borderWidth: 3,
		borderStyle: 'dashed',
		borderColor: black,
	},
	vert_bar: {
		position: 'absolute',
		bottom: 0,
		backgroundColor: blue,
	},
})

export default Block
