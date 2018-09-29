import React from 'react'
import {StyleSheet, View, Text} from 'react-native'

const Placard = ({position, width, height, view_style, label, label_style}) => {
	label = 'yay!'
	return (
		<View
			style={[
				styles.placard,
				{
					left: position[0],
					bottom: position[1],
					width,
					height,
				},
				view_style,
			]}
		>
			<Text style={[styles.text, label_style]}>{label}</Text>
		</View>
	)
}

const blue = 'blue'
const black = 'black'
const styles = StyleSheet.create({
	placard: {
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: '30%',
		borderWidth: 20,
		borderColor: blue,
	},
	text: {
		color: black,
		fontSize: 50,
	},
})

export default Placard
