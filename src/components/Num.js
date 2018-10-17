import React from 'react'
import {StyleSheet, View} from 'react-native'
import Tower from './Tower'
import TowerName from './TowerName'

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
	let tower_name_style =
		misc && misc.tower_name_style ? misc.tower_name_style : null
	const tn =
		misc && misc.hide_tower_name ? null : (
			<TowerName
				anim_info={anim_info}
				id={id}
				just_grey={just_grey}
				name={name}
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
