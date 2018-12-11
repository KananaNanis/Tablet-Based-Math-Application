// @flow

import {Dimensions} from 'react-native'
import type {NativeEvent, PanEvent, DimensionsType} from './types'
import {Gesture} from './constants'

const centralizeCoordinates = (
	nativeEvent: NativeEvent,
	dimensions: DimensionsType,
): NativeEvent => {
	const {width, height} = Dimensions.get('window')
	const diffWidth = width - dimensions.width
	const diffHeight = height - dimensions.height
	const centerX = nativeEvent.pageX - dimensions.width / 2 - diffWidth
	const centerY = nativeEvent.pageY - dimensions.height / 2 - diffHeight
	return {
		...nativeEvent,
		pageX: centerX,
		pageY: centerY,
	}
}

export const createPanEvent = (
	nativeEvent: NativeEvent,
	firstEvent: NativeEvent,
	state: number,
	dimensions: DimensionsType,
): PanEvent => {
	const formattedEvent = centralizeCoordinates(nativeEvent, dimensions)
	const firstEventCentered = centralizeCoordinates(firstEvent, dimensions)
	return {
		x: formattedEvent.pageX,
		y: formattedEvent.pageY,
		state: state,
		translationX: formattedEvent.pageX - firstEventCentered.pageX,
		translationY: formattedEvent.pageY - firstEventCentered.pageY,
		gesture: Gesture.PAN,
	}
}

export const createRotationEvent = (
	nativeEvent: NativeEvent,
	firstEvent: NativeEvent,
	state: number,
	dimensions: DimensionsType,
) => {
	const currentEvent = centralizeCoordinates(nativeEvent, dimensions)
	const firstEventCentered = centralizeCoordinates(firstEvent, dimensions)
	const anchorTouch =
		firstEventCentered.touches[0].identifier <
		firstEventCentered.touches[1].identifier
			? firstEventCentered.touches[0]
			: firstEventCentered.touches[1]

	const anchorId = anchorTouch.identifier

	const oldMovableTouch =
		firstEventCentered.touches[0].identifier === anchorId
			? firstEventCentered.touches[1]
			: firstEventCentered.touches[0]

	const newMovableTouch =
		currentEvent.touches[0].identifier === anchorId
			? currentEvent.touches[1]
			: currentEvent.touches[0]

	const oldVec = {
		x: oldMovableTouch.pageX - anchorTouch.pageX,
		y: oldMovableTouch.pageY - anchorTouch.pageY,
	}
	const newVec = {
		x: newMovableTouch.pageX - anchorTouch.pageX,
		y: newMovableTouch.pageY - anchorTouch.pageY,
	}
	const rotation =
		(Math.atan2(newVec.y, newVec.x) - Math.atan2(oldVec.y, oldVec.x)) %
		(Math.PI * 2)
	return {
		x: currentEvent.pageX,
		y: currentEvent.pageY,
		state: state,
		rotation: rotation,
		gesture: Gesture.ROTATE,
	}
}
