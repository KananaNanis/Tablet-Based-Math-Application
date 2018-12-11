// @flow

import {Animated} from 'react-native'

export type PiecesData = {
	image: string,
	rotate: Animated.Value,
	rotateStr: string,
	lastRotate: number,
	translateX: Animated.Value,
	translateY: Animated.Value,
	lastOffset: {x: number, y: number},
	width: number,
	height: number,
	shape: string,
}

export type PiecesDataCollection = {
	[key: string]: PiecesData,
}
