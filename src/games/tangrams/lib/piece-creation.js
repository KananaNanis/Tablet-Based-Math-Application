// @flow

import React from 'react'
import map from 'lodash/map'
import {Animated, StyleSheet} from 'react-native'

export const createMovablePieces = (piecesData: any, uniqKey?: string) =>
	map(piecesData, (val, key) => (
		<Animated.Image
			key={`${key}-${uniqKey || ''}`}
			source={val.image}
			style={[
				styles.pinchableImage,
				{
					transform: [
						{translateX: val.translateX},
						{translateY: val.translateY},
						{rotate: val.rotateStr},
					],
					width: val.width,
					height: val.height,
				},
			]}
		/>
	))

const styles = StyleSheet.create({
	pinchableImage: {
		position: 'absolute',
		zIndex: 100,
	},
})

const piecesLibrary = (scale: number, isBlack: boolean) => ({
	bigTriangle: {
		image: !isBlack
			? require('../../../assets/img/tangrams/big-triangle.png')
			: require('../../../assets/img/tangrams/big-triangle-black.png'),
		width: scale * Math.sqrt(2),
		height: scale * 2 * Math.sqrt(2),
	},
	mediumTriangle: {
		image: !isBlack
			? require('../../../assets/img/tangrams/medium-triangle.png')
			: require('../../../assets/img/tangrams/medium-triangle-black.png'),
		width: scale * Math.sqrt(2),
		height: scale * Math.sqrt(2),
	},
	parallelogram: {
		image: !isBlack
			? require('../../../assets/img/tangrams/parallelogram.png')
			: require('../../../assets/img/tangrams/parallelogram-black.png'),
		width: scale * 2 * Math.sqrt(2),
		height: scale * Math.sqrt(0.5),
	},
	smallTriangle: {
		image: !isBlack
			? require('../../../assets/img/tangrams/small-triangle.png')
			: require('../../../assets/img/tangrams/small-triangle-black.png'),
		width: scale * Math.sqrt(2),
		height: scale * Math.sqrt(0.5),
	},
	square: {
		image: !isBlack
			? require('../../../assets/img/tangrams/square.png')
			: require('../../../assets/img/tangrams/square-black.png'),
		width: scale * Math.sqrt(2),
		height: scale * Math.sqrt(2),
	},
})

export const getMovablePiecesData = (
	pieces: any,
	scale: number,
	isBlack: boolean,
) => {
	let movablePiecesData = {}
	map(pieces, (val, key) => {
		const rotate = new Animated.Value(val.initialAngle)
		rotate.setValue(0)
		rotate.setOffset(val.initialAngle)
		const rotateStr = rotate.interpolate({
			inputRange: [-100, 100],
			outputRange: ['-100rad', '100rad'],
		})
		const scaledInitialX = val.initialX * scale
		const scaledInitialY = val.initialY * scale
		const initialX = new Animated.Value(scaledInitialX)
		initialX.setValue(0)
		initialX.setOffset(scaledInitialX)
		const initialY = new Animated.Value(scaledInitialY)
		initialY.setValue(0)
		initialY.setOffset(scaledInitialY)
		const shapeInfo = piecesLibrary(scale, isBlack)
		movablePiecesData[key] = {
			...val,
			image: shapeInfo[val.shape].image,
			width: shapeInfo[val.shape].width,
			height: shapeInfo[val.shape].height,
			lastOffset: {x: scaledInitialX, y: scaledInitialY},
			lastRotate: val.initialAngle,
			rotate: rotate,
			rotateStr: rotateStr,
			translateX: initialX,
			translateY: initialY,
		}
	})
	console.log(movablePiecesData)
	return movablePiecesData
}

export const getStaticPiecesData = (shapes: any, scale: number) => {
	let goalPiecesData = {}
	map(shapes, (val, key) => {
		const shapeInfo = piecesLibrary(scale, true)
		const scaledInitialX = val.initialX * scale
		const scaledInitialY = val.initialY * scale
		const rotate = new Animated.Value(val.initialAngle)
		rotate.setValue(0)
		rotate.setOffset(val.initialAngle)
		const rotateStr = rotate.interpolate({
			inputRange: [-100, 100],
			outputRange: ['-100rad', '100rad'],
		})
		goalPiecesData[key] = {
			...val,
			image: shapeInfo[val.shape].image,
			width: shapeInfo[val.shape].width,
			height: shapeInfo[val.shape].height,
			rotateStr: rotateStr,
			initialX: scaledInitialX,
			initialY: scaledInitialY,
		}
	})
	return goalPiecesData
}
