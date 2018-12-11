import React from 'react'
import {StyleSheet, View, PanResponder} from 'react-native'
import WorkspaceContainer from './containers/WorkspaceContainer'
import {
	global_screen_width,
	global_screen_height,
	global_grass_height,
} from './components/Workspace'
import {touchHandler} from './event/event'
import PrintFigure from './components/PrintFigure'
import {
	load_config_tree,
	global_constant,
	load_sounds,
	doAction,
} from './lib/global'
import {query_path, with_suffix} from './providers/query_store'
import {Tangrams} from './games/tangrams'
import {connect} from 'react-redux'

// top level component
class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {do_print: false, has_error: false}
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
		load_sounds()
	}
	componentDidCatch(error, info) {
		// Display fallback UI
		this.setState({has_error: true})
		// log the error
		const cp = query_path('config').toJS()
		doAction.addLogEntry(Date.now(), [with_suffix(cp), 'error', error, info])
	}
	render() {
		//console.log(global_screen_height)
		//console.log('misc for tower_result', query_obj_misc('tower_result'))
		let tablet_border, scaling_border
		if (this.state.has_error) {
			console.log('Error caught at top level.')
			return <h1>Something went wrong.</h1>
		}
		if (this.props.is_game) {
			if (this.props.game_name === 'tangrams') {
				return <Tangrams level={this.props.game_level_name} />
			}
		}
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

function mapStateToProps(state) {
	return {
		is_game: state ? state.getIn(['prop', 'is_game']) : false,
		game_name: state ? state.getIn(['prop', 'game_name']) : '',
		game_level_name: state ? state.getIn(['prop', 'game_level_name']) : '',
	}
}

export default connect(mapStateToProps)(App)

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
