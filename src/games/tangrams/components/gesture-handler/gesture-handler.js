// @flow

import React from 'react'
import {View, StyleSheet, Dimensions} from 'react-native'
import {HandlerState, Gesture} from './constants'
import type {NativeEvent, PanEvent, RotationEvent, NativeLayout} from './types'
import {createPanEvent, createRotationEvent} from './events'

type Props = {
	children: any,
	onPanGestureEvent: (panEvent: PanEvent) => any,
	onPanHandlerStateChange: (panEvent: PanEvent) => any,
	onRotateGestureEvent: (rotationEvent: RotationEvent) => any,
	onRotateHandlerStateChange: (rotationEvent: RotationEvent) => any,
	width: number,
}

export class PanRotateGestureHandler extends React.Component<Props> {
	_currentGesture: number
	_firstEvent: NativeEvent
	_lastEvent: NativeEvent
	_dimensions: {width: number, height: number}

	onActivate = ({nativeEvent}: {nativeEvent: NativeEvent}) => {
		if (nativeEvent.touches.length === 1) {
			this._currentGesture = Gesture.PAN
			const panEvent: PanEvent = createPanEvent(
				nativeEvent,
				nativeEvent,
				HandlerState.BEGAN,
				this._dimensions,
			)
			this.props.onPanHandlerStateChange(panEvent)
		} else if (nativeEvent.touches.length === 2) {
			this._currentGesture = Gesture.ROTATE
			const rotationEvent: RotationEvent = createRotationEvent(
				nativeEvent,
				nativeEvent,
				HandlerState.BEGAN,
				this._dimensions,
			)
			this.props.onRotateHandlerStateChange(rotationEvent)
		} else {
			this._currentGesture = Gesture.UNDEFINED
		}
		this._firstEvent = nativeEvent
		this._lastEvent = nativeEvent
	}

	onMove = ({nativeEvent}: {nativeEvent: NativeEvent}) => {
		if (this._currentGesture === Gesture.PAN) {
			if (nativeEvent.touches.length === 2) {
				this.resolveOldGesture({
					nativeEvent: this._lastEvent,
					oldGesture: Gesture.PAN,
				})
				this._currentGesture = Gesture.ROTATE
				this.switchGesture({
					nativeEvent: nativeEvent,
					newGesture: Gesture.ROTATE,
				})
				return
			}
			const panEvent: PanEvent = createPanEvent(
				nativeEvent,
				this._firstEvent,
				HandlerState.ACTIVE,
				this._dimensions,
			)
			this.props.onPanGestureEvent(panEvent)
		} else if (this._currentGesture === Gesture.ROTATE) {
			if (nativeEvent.touches.length === 1) {
				this.resolveOldGesture({
					nativeEvent: this._lastEvent,
					oldGesture: Gesture.ROTATE,
				})
				this._currentGesture = Gesture.PAN
				this.switchGesture({nativeEvent: nativeEvent, newGesture: Gesture.PAN})
				return
			}
			const rotationEvent: RotationEvent = createRotationEvent(
				nativeEvent,
				this._firstEvent,
				HandlerState.ACTIVE,
				this._dimensions,
			)
			this.props.onRotateGestureEvent(rotationEvent)
		}
		this._lastEvent = nativeEvent
	}

	onReject = () => {
		console.log('rejected')
	}

	switchGesture = ({
		nativeEvent,
		newGesture,
	}: {
		nativeEvent: NativeEvent,
		newGesture: number,
	}) => {
		if (newGesture === Gesture.PAN) {
			const panEvent: PanEvent = createPanEvent(
				nativeEvent,
				nativeEvent,
				HandlerState.ACTIVE,
				this._dimensions,
			)
			this.props.onPanHandlerStateChange(panEvent)
		} else if (newGesture === Gesture.ROTATE) {
			const rotationEvent: RotationEvent = createRotationEvent(
				nativeEvent,
				nativeEvent,
				HandlerState.BEGAN,
				this._dimensions,
			)
			this.props.onRotateHandlerStateChange(rotationEvent)
		}
		this._firstEvent = nativeEvent
		this._lastEvent = nativeEvent
	}

	resolveOldGesture = ({
		nativeEvent,
		oldGesture,
	}: {
		nativeEvent: NativeEvent,
		oldGesture: number,
	}) => {
		if (oldGesture === Gesture.PAN) {
			const panEvent: PanEvent = createPanEvent(
				nativeEvent,
				this._firstEvent,
				HandlerState.END,
				this._dimensions,
			)
			this.props.onPanHandlerStateChange(panEvent)
		} else if (oldGesture === Gesture.ROTATE) {
			const rotationEvent: RotationEvent = createRotationEvent(
				nativeEvent,
				this._firstEvent,
				HandlerState.END,
				this._dimensions,
			)
			this.props.onRotateHandlerStateChange(rotationEvent)
		}
	}

	onRelease = ({nativeEvent}: {nativeEvent: NativeEvent}) => {
		if (this._currentGesture === Gesture.PAN) {
			const panEvent: PanEvent = createPanEvent(
				this._lastEvent,
				this._firstEvent,
				HandlerState.END,
				this._dimensions,
			)
			this.props.onPanHandlerStateChange(panEvent)
		} else if (this._currentGesture === Gesture.ROTATE) {
			const rotationEvent: RotationEvent = createRotationEvent(
				this._lastEvent,
				this._firstEvent,
				HandlerState.END,
				this._dimensions,
			)
			this.props.onRotateHandlerStateChange(rotationEvent)
		}
		this._lastEvent = nativeEvent
		this._currentGesture = Gesture.UNDEFINED
	}

	onLayout = ({nativeEvent}: {nativeEvent: NativeLayout}) => {
		console.log(nativeEvent)
		const {width, height} = nativeEvent.layout
		this._dimensions = {width, height}
	}

	onTerminate = () => {
		console.log('terminated')
	}

	render() {
		return (
			<View
				onLayout={this.onLayout}
				onMoveShouldSetResponder={() => true}
				onResponderGrant={this.onActivate}
				onResponderMove={this.onMove}
				onResponderReject={this.onReject}
				onResponderRelease={this.onRelease}
				onResponderTerminate={this.onTerminate}
				onResponderTerminationRequest={() => true}
				onStartShouldSetResponder={() => true}
				style={[styles.container, {width: this.props.width}]}
			>
				{this.props.children}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
})
