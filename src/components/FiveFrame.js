import React from 'react'
import {StyleSheet, View} from 'react-native'

const squareSide = 220
const borderWidth = 10

const FiveFrameSquare = ({empty, id}) => {
	let inside = empty ? null : <View style={styles.dot} />
	const vert = {bottom: id * (squareSide - borderWidth)}
	return <View style={[styles.oneSquare, vert]}>{inside}</View>
}

const FiveFrame = ({name, position, misc}) => {
	const extra_scale =
		misc && 'undefined' !== typeof misc.extra_scale ? misc.extra_scale : 1
	extra_scale // use this where?

	let pos_info = {left: position[0], bottom: position[1]}
	let squares = []
	for (let i = 0; i < 5; ++i) {
		squares.push(
			<FiveFrameSquare key={i} empty={i >= name} id={i} style={styles.dot} />,
		)
	}
	return <View style={[styles.frame, pos_info]}>{squares}</View>
}

const black = 'black'
const styles = StyleSheet.create({
	frame: {
		position: 'absolute',
	},
	oneSquare: {
		position: 'absolute',
		width: squareSide,
		height: squareSide,
		borderColor: black,
		borderWidth: borderWidth,
	},
	dot: {
		position: 'absolute',
		left: squareSide / 4 - borderWidth,
		bottom: squareSide / 4 - borderWidth,
		width: squareSide / 2,
		height: squareSide / 2,
		backgroundColor: black,
		borderRadius: '50%',
	},
})

export default FiveFrame
