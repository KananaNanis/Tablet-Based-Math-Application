import React from 'react'
import {StyleSheet, View, PanResponder} from 'react-native'
import WorkspaceContainer from './containers/WorkspaceContainer'
import {
	global_screen_width,
	global_screen_height,
	global_grass_height,
} from './components/Workspace'
import {touchHandler} from './event/event'
import Sound from './assets/sound'
import PrintFigure from './components/PrintFigure'
import {load_config_tree, global_constant} from './lib/global'

export let global_sound = {}

// top level component
export default class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {do_print: false}
		const poll_to_see_if_config_tree_changed = true
		if (poll_to_see_if_config_tree_changed) {
			window.setInterval(load_config_tree, 3000, this)
		} else load_config_tree(this)
		this._panResponder = PanResponder.create({
			onStartShouldSetPanResponder: _ => true,
			onMoveShouldSetPanResponder: _ => true,
			onPanResponderGrant: (evt, gestureState) =>
				touchHandler(evt, gestureState),
			onPanResponderMove: (evt, gestureState) =>
				touchHandler(evt, gestureState),
			onPanResponderRelease: (evt, gestureState) =>
				touchHandler(evt, gestureState),
			onPanResponderTerminationRequest: _ => false,
		})
	}
	componentDidMount() {
		// preload some sounds?
		const available_sounds = [
			'chirp1',
			'chirp2',
			'bells',
			'level0',
			'level1',
			'level2',
			'level3',
		]
		for (const snd of available_sounds) {
			global_sound[snd] = new Sound('assets/snd/' + snd + '.wav')
		}
		global_sound['chirp1'] = new Sound('assets/snd/chirp1.wav')
	}
	render() {
		//console.log(global_screen_height)
		let tablet_border, scaling_border
		if (this.state.add_tablet_border) {
			tablet_border = (
				<View
					style={[
						styles.tablet_border,
						{
							width: global_constant.tablet_width,
							height: global_constant.tablet_height,
						},
					]}
				/>
			)
		}
		if (this.state.add_scaling_border) {
			scaling_border = (
				<View
					style={[
						styles.scaling_border,
						{
							width: global_screen_width,
							height: global_screen_height,
						},
					]}
				/>
			)
		}
		// console.log('rendering root')
		if (this.state.do_print) return <PrintFigure />
		// top level view, sets up event listeners
		return (
			<View
				{...this._panResponder.panHandlers}
				/*  if panResponder is not needed, here's lower level:
				onMoveShouldSetResponder={_ => true}
				onResponderGrant={evt => touchHandler(evt)}
				onResponderMove={evt => touchHandler(evt)}
				onResponderRelease={evt => touchHandler(evt)}
				onResponderTerminationRequest={_ => false}
				onStartShouldSetResponder={_ => true}
				*/
				style={[
					styles.root,
					{
						width: global_screen_width,
						height: global_screen_height,
						transform: [{scale: global_constant.laptop_scaling_factor}],
					},
				]}
			>
				<View
					style={[
						styles.grass,
						{
							width: global_screen_width,
						},
					]}
				/>
				<WorkspaceContainer />
				{tablet_border}
				{scaling_border}
			</View>
		)
	}
}

const grassColor = 'lightgreen'
const scalingBorderColor = '#43464b'
const tabletBorderColor = 'purple'
const styles = StyleSheet.create({
	root: {
		transformOrigin: 'top left',
	},
	grass: {
		backgroundColor: grassColor,
		height: global_grass_height,
		position: 'absolute',
		left: 0,
		bottom: 0,
	},
	tablet_border: {
		position: 'absolute',
		// backgroundColor: tabletBorderColor,
		borderColor: tabletBorderColor,
		borderWidth: 1,
	},
	scaling_border: {
		position: 'absolute',
		borderColor: scalingBorderColor,
		borderWidth: 10,
	},
})
