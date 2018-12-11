// @flow

import minBy from 'lodash/minBy'
import type {
	GestureEvent,
	PanEvent,
	RotationEvent,
} from '../components/gesture-handler/types'
import {HandlerState} from '../components/gesture-handler'

export const getSelectedShape = (
	event: GestureEvent,
	piecesData: any,
): ?string => {
	let selectedShapes = []
	for (const key of Object.keys(piecesData)) {
		const xDist = Math.abs(event.x - piecesData[key].lastOffset.x)
		const yDist = Math.abs(event.y - piecesData[key].lastOffset.y)

		if (
			xDist < piecesData[key].width / 2 &&
			yDist < piecesData[key].height / 2
		) {
			const absDist = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
			selectedShapes = [{key: key, dist: absDist}, ...selectedShapes]
		}
	}
	if (selectedShapes.length === 0) {
		return undefined
	}
	const selectedShape = minBy(selectedShapes, shape => shape.dist)
	return selectedShape.key
}

export const panGestureUpdate = (
	panEvent: PanEvent,
	selectedKey: ?string,
	piecesData: any,
) => {
	if (selectedKey) {
		piecesData[selectedKey].translateX.setValue(panEvent.translationX)
		piecesData[selectedKey].translateY.setValue(panEvent.translationY)
	}
}

export const panHandlerStateChange = (
	panEvent: PanEvent,
	selectedKey: ?string,
	piecesData: any,
) => {
	if (panEvent.state === HandlerState.END && selectedKey) {
		const selectedPiece = piecesData[selectedKey]
		selectedPiece.lastOffset.x += panEvent.translationX
		selectedPiece.lastOffset.y += panEvent.translationY
		selectedPiece.translateX.setOffset(selectedPiece.lastOffset.x)
		selectedPiece.translateX.setValue(0)
		selectedPiece.translateY.setOffset(selectedPiece.lastOffset.y)
		selectedPiece.translateY.setValue(0)
	}
}

export const rotateGestureUpdate = (
	rotationEvent: RotationEvent,
	selectedKey: ?string,
	piecesData: any,
) => {
	if (selectedKey) {
		piecesData[selectedKey].rotate.setValue(rotationEvent.rotation)
	}
}

export const rotateHandlerStateChange = (
	rotationEvent: RotationEvent,
	selectedKey: ?string,
	piecesData: any,
) => {
	if (rotationEvent.state === HandlerState.BEGAN && selectedKey) {
		piecesData[selectedKey].rotate.setOffset(piecesData[selectedKey].lastRotate)
		piecesData[selectedKey].rotate.setValue(0)
	}
	if (rotationEvent.state === HandlerState.END && selectedKey) {
		const degrees = (rotationEvent.rotation * 180) / Math.PI
		const roundedRotation = (Math.round(degrees / 5) * 5 * Math.PI) / 180
		piecesData[selectedKey].lastRotate += roundedRotation
		piecesData[selectedKey].lastRotate =
			piecesData[selectedKey].lastRotate % (2 * Math.PI)
		piecesData[selectedKey].rotate.setOffset(piecesData[selectedKey].lastRotate)
		piecesData[selectedKey].rotate.setValue(0)
	}
}
