import React from 'react'
import {View, Image, Text, StyleSheet} from 'react-native'
import {fromJS} from 'immutable'
import {image_location} from '../App'
import {query_tower_name} from '../providers/query_tower'

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

export function name_is_in_standard_form(name0) {
	let res = true
	let name = name0.toJS()
	let reason = ''
	for (let i = 0; i < name.length; ++i) {
		let group1 = name[i]
		let how_many1 = get_how_many_from_group(group1)
		let is_fiver1 = get_is_fiver_from_group(group1)
		if (!is_fiver1 && how_many1 > 4) {
			res = false
			reason = 'more than 4'
			break
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
			if (!is_fiver0 || is_fiver1) {
				//console.log('group01', group0, group1, 'is_fiver01', is_fiver0, is_fiver1)
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

export function is_standard_tower(tgt) {
	return name_is_in_standard_form(query_tower_name(tgt))
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
}) => {
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
				style={[styles.image_default, radius_style, {width, height}]}
			/>
		)
	}
	let txt = null
	if ('|' === text_content) {
		txt = <View style={styles.vert_bar} />
	} else {
		txt = <Text style={text_style}>{text_content}</Text>
	}

	return (
		<View style={[view_style, radius_style, {width, height}]}>
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
		backgroundColor: none,
		borderWidth: 3,
		borderStyle: 'dashed',
		borderColor: black,
	},
	vert_bar: {
		position: 'absolute',
		left: 30,
		bottom: 0,
		backgroundColor: blue,
		width: 10,
		height: 520,
	},
})

export default Block
