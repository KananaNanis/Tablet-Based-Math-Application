import React from 'react'
import {View, Text} from 'react-native'

export class Tangrams extends React.Component {
	render() {
		const {level} = this.props
		return (
			<View>
				<Text>{level}</Text>
			</View>
		)
	}
}
