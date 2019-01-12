import React from 'react'
import {StyleSheet, View, Text, Image} from 'react-native'
import {global_constant} from '../lib/global'
import {query_button_detail} from '../providers/query_store'
import {image_location} from '../lib/images'

export function get_special_button_geom(i) {
	let res = global_constant.special_button_geoms[i]
	if ('submit' === i && 'on_right' === query_button_detail(i)) {
		res = global_constant.special_button_geoms['submit_on_right']
	}
	return res
}

const Button = ({
	position,
	width,
	height,
	view_style,
	label,
	label_style,
	image_name,
	image_style,
}) => {
	let img = !image_name ? null : (
		<Image key={1} source={image_location(image_name)} style={image_style} />
	)
	return (
		<View
			style={[
				styles.button,
				{
					left: position[0],
					bottom: position[1],
					width,
					height,
				},
				view_style,
			]}
		>
			{img}
			<Text style={label_style}>{label}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	button: {
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: '10%',
	},
})

export default Button
