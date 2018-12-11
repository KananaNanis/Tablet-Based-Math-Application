import React from 'react'
import {View, Dimensions, StyleSheet} from 'react-native'
import {doAction} from '../../lib/global'
import {levels} from './config/levels.json'
import {TangramsLevel} from './components/level'

const {width} = Dimensions.get('window')

export class Tangrams extends React.Component {
	backToCoreApp = () => {
		console.log('back to core app')
		doAction.setProp('is_game', false)
	}

	render() {
		const {game_level_name} = this.props
		const currentLevel = levels.find(level => level.name === game_level_name)
		return (
			<View style={styles.wrapper}>
				<TangramsLevel
					currentLevel={currentLevel}
					onSolved={this.backToCoreApp}
				/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		width: width,
	},
})
