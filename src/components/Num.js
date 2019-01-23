import React from 'react'
import {StyleSheet, View} from 'react-native'
import Tower from './Tower'
import TowerName from './TowerName'
import TowerNumber from './TowerNumber'
import {get_is_fiver_from_group, get_block_size_from_group} from './Block'

export const global_fiver_shadow = [
	{},
	{
		textShadowColor: 'orange',
		textShadowOffset: {width: -3, height: 0},
		textShadowRadius: 0,
	},
	{
		textShadowColor: 'orange',
		textShadowOffset: {width: 3, height: 0},
		textShadowRadius: 0,
	},
]

function only_fivers(name, reverse) {
	let res = []
	for (const i of name) {
		if (reverse) {
			if (!get_is_fiver_from_group(i)) res.push(i)
		} else {
			if (get_is_fiver_from_group(i)) res.push(i)
		}
	}
	// console.log('only_fivers name', name, 'reverse', reverse, 'res', res)
	return res
}

function only_one_size(name, size) {
	let res = []
	for (const i of name) {
		if (size === get_block_size_from_group(i)) res.push(i)
	}
	return res
}

const Num = ({
	id,
	name,
	position,
	style,
	anim_info,
	misc,
	tower_style,
	block_opacity,
	block_anim_info,
	scale_factor,
	just_grey = false,
}) => {
	//console.log('Num id', id, 'anim_info', anim_info)
	let tn_name = name
	if (misc && misc.show_only_fivers) tn_name = only_fivers(tn_name)
	if (misc && misc.show_only_singletons) tn_name = only_fivers(tn_name, true)
	if (misc && misc.show_only_size) {
		tn_name = only_one_size(tn_name, misc.show_only_size)
	}
	let tm_name = name
	let tower_name_style =
		misc && misc.tower_name_style ? misc.tower_name_style : null
	let tower_number_style =
		misc && misc.tower_number_style ? misc.tower_number_style : null
	let tn_anim_info, tm_anim_info, t_anim_info

	if (anim_info && tower_style && tower_style.opacity === 0) {
		tn_anim_info = anim_info
		tm_anim_info = anim_info
	} else if (anim_info) {
		tn_anim_info = anim_info
		tm_anim_info = anim_info
		t_anim_info = anim_info
	}
	const tn =
		misc && misc.hide_tower_name ? null : (
			<TowerName
				anim_info={tn_anim_info}
				id={id}
				just_grey={just_grey}
				name={tn_name}
				position={position}
				tower_name_style={tower_name_style}
			/>
		)
	const tm =
		misc && misc.hide_tower_number ? null : (
			<TowerNumber
				anim_info={tm_anim_info}
				hide_image={misc && misc.hide_image}
				id={id}
				just_grey={just_grey}
				name={tm_name}
				position={position}
				tower_number_style={tower_number_style}
			/>
		)
	// misc = { top_just_outline: true }
	//misc = { as_diagram: true }
	const hide_all_tower_names = true
	return (
		<View style={[styles.num, style, {left: position[0], bottom: position[1]}]}>
			<Tower
				anim_info={t_anim_info}
				block_anim_info={block_anim_info}
				block_opacity={block_opacity}
				id={id}
				just_grey={just_grey}
				misc={misc}
				name={name}
				position={position}
				scale_factor={scale_factor}
				style={tower_style}
			/>
			{hide_all_tower_names ? null : tn}
			{tm}
		</View>
	)
}

const styles = StyleSheet.create({
	num: {
		position: 'absolute',
	},
})

export default Num
