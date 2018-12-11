// @flow

import React from 'react'
import {Animated, StyleSheet, Dimensions} from 'react-native'
import type {
	GestureEvent,
	PanEvent,
	RotationEvent,
} from './gesture-handler/types'
import {PanRotateGestureHandler, HandlerState} from './gesture-handler'
import {
	getSelectedShape,
	panGestureUpdate,
	panHandlerStateChange,
	rotateGestureUpdate,
	rotateHandlerStateChange,
} from '../lib/events'
import {getMovablePiecesData, getStaticPiecesData} from '../lib/piece-creation'
import map from 'lodash/map'
import find from 'lodash/find'
import type {PiecesDataCollection} from '../config/types'
import {Yay} from './yay'

const {width} = Dimensions.get('window')

type Props = {
	level: string,
	onSolved: () => any,
}

type ComponentState = {
	solved: boolean,
}

export class TangramsLevel extends React.Component<Props, ComponentState> {
	selectedKey: ?string
	piecesData: PiecesDataCollection
	goalShapeData: any
	numberOfMatchedPieces: number
	matchedPieces: any

	constructor(props: Props) {
		super(props)
		const {currentLevel} = this.props
		const {width} = Dimensions.get('window')
		const scale = width / 6
		this.selectedKey = undefined
		const piecesData = getMovablePiecesData(
			currentLevel.movablePieces,
			scale,
			false,
		)
		this.piecesData = {}
		this.numberOfMatchedPieces = 0
		this.matchedPieces = {}
		map(piecesData, (val, key) => {
			this.matchedPieces[key] = false
			this.piecesData[key] = {
				image: val.image,
				rotate: val.rotate,
				rotateStr: val.rotateStr,
				lastRotate: val.initialAngle,
				translateX: val.translateX,
				translateY: val.translateY,
				lastOffset: val.lastOffset,
				width: val.width,
				height: val.height,
				shape: val.shape,
			}
		})
		this.goalShapeData = getStaticPiecesData(currentLevel.goalPieces, scale)
	}

	state = {
		solved: false,
	}

	solvedPuzzle = () => {
		this.setState(() => ({solved: true}))
		setTimeout(() => {
			this.props.onSolved()
		}, 2000)
	}

	updateSelectedShape = (event: GestureEvent) => {
		this.selectedKey = getSelectedShape(event, this.piecesData)
	}

	onPanGestureEvent = (panEvent: PanEvent) => {
		panGestureUpdate(panEvent, this.selectedKey, this.piecesData)
	}

	onPanHandlerStateChange = (panEvent: PanEvent) => {
		if (panEvent.state === HandlerState.BEGAN) {
			this.updateSelectedShape(panEvent)
		}
		if (panEvent.state === HandlerState.END) {
			const selectedKey = this.selectedKey
			panHandlerStateChange(panEvent, selectedKey, this.piecesData)
			if (selectedKey) {
				const selectedPiece = this.piecesData[selectedKey]
				const matchedGoalPiece = find(this.goalShapeData, shape => {
					const sameShape = shape.shape === selectedPiece.shape
					const xMatches =
						Math.abs(selectedPiece.lastOffset.x - shape.initialX) < 10
					const yMatches =
						Math.abs(selectedPiece.lastOffset.y - shape.initialY) < 10
					return sameShape && xMatches && yMatches
				})
				if (matchedGoalPiece) {
					selectedPiece.translateX.setOffset(matchedGoalPiece.initialX)
					selectedPiece.translateX.setValue(0)
					selectedPiece.translateY.setOffset(matchedGoalPiece.initialY)
					selectedPiece.translateY.setValue(0)
					if (!this.matchedPieces[selectedKey]) {
						this.numberOfMatchedPieces += 1
						this.matchedPieces[selectedKey] = true
					}
					if (
						this.numberOfMatchedPieces ===
						Object.keys(this.goalShapeData).length
					) {
						this.solvedPuzzle()
					}
				} else {
					if (this.matchedPieces[selectedKey]) {
						this.numberOfMatchedPieces -= 1
						this.matchedPieces[selectedKey] = false
					}
				}
			}
		}
	}

	onRotateHandlerStateChange = (rotationEvent: RotationEvent) => {
		if (rotationEvent.state === HandlerState.BEGAN) {
			rotateHandlerStateChange(rotationEvent, this.selectedKey, this.piecesData)
		}
		if (rotationEvent.state === HandlerState.END) {
			rotateHandlerStateChange(rotationEvent, this.selectedKey, this.piecesData)
		}
	}

	onRotateGestureEvent = (rotationEvent: RotationEvent) => {
		rotateGestureUpdate(rotationEvent, this.selectedKey, this.piecesData)
	}

	render() {
		if (this.state.solved) {
			return <Yay />
		}
		const movablePieces = map(this.piecesData, (val, key) => (
			<Animated.Image
				key={key}
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

		const staticPieces = map(this.goalShapeData, (val, key) => (
			<Animated.Image
				key={`${key}-goal`}
				source={val.image}
				style={[
					styles.pinchableImage,
					{
						transform: [
							{translateX: val.initialX},
							{translateY: val.initialY},
							{rotate: val.rotateStr},
						],
						width: val.width,
						height: val.height,
					},
				]}
			/>
		))
		return (
			<PanRotateGestureHandler
				onPanGestureEvent={this.onPanGestureEvent}
				onPanHandlerStateChange={this.onPanHandlerStateChange}
				onRotateGestureEvent={this.onRotateGestureEvent}
				onRotateHandlerStateChange={this.onRotateHandlerStateChange}
				width={width}
			>
				<Animated.View collapsable={false} style={styles.container}>
					{staticPieces}
					{movablePieces}
				</Animated.View>
			</PanRotateGestureHandler>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		overflow: 'hidden',
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		width: width,
	},
	pinchableImage: {
		position: 'absolute',
		zIndex: 100,
	},
})
