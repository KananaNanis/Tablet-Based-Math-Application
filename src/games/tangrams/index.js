import React from 'react'
import {View, Text, Dimensions} from 'react-native'
import {doAction} from '../../lib/global'
import {connect} from 'react-redux'
import {levels} from './config/levels.json'
import {TangramsLevel} from './components/level'

export class TangramsView extends React.Component {

  componentDidMount() {
    // setTimeout(() => {
    //   doAction.setProp('game_level_name', 'cat')
    // }, 3000)
  }

  backToCoreApp = () => {
    console.log('back to core app')
    doAction.setProp('is_game', false)
  }

	render() {
		const {game_level_name} = this.props
    const {width} = Dimensions.get('window')
    console.log(levels)
    const currentLevel = levels.find(level => level.name === game_level_name)
		return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', width: width}}>
        <TangramsLevel
          currentLevel={currentLevel}
          onSolved={this.backToCoreApp}
        />
      </View>
		)
	}
}

function mapStateToProps(state) {
	return {
		game_level_name: state ? state.getIn(['prop', 'game_level_name']) : '',
	}
}

export const Tangrams = connect(mapStateToProps)(TangramsView)
