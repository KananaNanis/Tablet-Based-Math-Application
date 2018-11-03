import React from 'react'
import {StyleSheet, View} from 'react-native'
import Tower from './Tower'
import TowerName from './TowerName'
import { get_is_fiver_from_group, get_block_size_from_group } from './Block';

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
	scale_factor,
	just_grey = false,
}) => {
	let tn_name = name
	if (misc && misc.show_only_fivers) tn_name = only_fivers(tn_name)
	if (misc && misc.show_only_singletons) tn_name = only_fivers(tn_name, true)
	if (misc && misc.show_only_size) tn_name = only_one_size(tn_name, misc.show_only_size)
	let tower_name_style =
		misc && misc.tower_name_style ? misc.tower_name_style : null
	const tn =
		misc && misc.hide_tower_name ? null : (
			<TowerName
				anim_info={anim_info}
				id={id}
				just_grey={just_grey}
				name={tn_name}
				position={position}
				tower_name_style={tower_name_style}
			/>
		)
	// misc = { top_just_outline: true }
	//misc = { as_diagram: true }
	return (
		<View style={[styles.num, style, {left: position[0], bottom: position[1]}]}>
			<Tower
				anim_info={anim_info}
				block_opacity={block_opacity}
				id={id}
				just_grey={just_grey}
				misc={misc}
				name={name}
				position={position}
				scale_factor={scale_factor}
				style={tower_style}
			/>
			{tn}
		</View>
	)
}

const styles = StyleSheet.create({
	num: {
		position: 'absolute',
	},
})

export default Num
