import {connect} from 'react-redux'
import Camel from '../components/Camel'
import {global_constant, doAction} from '../App'
import {global_screen_width} from '../components/Workspace'
import {query_event, query_log, query_prop} from '../providers/query_store'

export function num_stars(err) {
	let n = -1
	const policy = query_event('star_policy')
	if (policy) {
		const thresh = global_constant.star_policy[policy]
		if (err < thresh[0] / 100) n = 3
		else if (err < thresh[1] / 100) n = 2
		else if (err < thresh[2] / 100) n = 1
		else if (err < thresh[3] / 100) n = 0
	}
	return n
}

export function get_recent_log_entries(log, descrip) {
	log = log || query_log()
	let log_entries = []
	for (let i = log.size - 1; i >= 0; --i) {
		if (
			'next_config' === log.getIn([i, 1, 1]) &&
			'start' === log.getIn([i, 1, 2])
		) {
			break
		}
		if (descrip === log.getIn([i, 1, 1])) log_entries.unshift(log.get(i).toJS())
	}
	return log_entries
}

const mapStateToProps = (state, ownProps) => {
	//console.log(ownProps)
	//let err_list = [.05, .1]
	//console.log(state.get('log').toJS())
	const log_entries = get_recent_log_entries(state.get('log'), 'is_correct')
	let err_total = 0
	let err_list = []
	for (let i = 0; i < log_entries.length; ++i) {
		const f3 = log_entries[i][1][3]
		const f1 = log_entries[i][1][4]
		const f2 = log_entries[i][1][5]
		let err
		if (query_event('just_proportion')) err = Math.abs(f3 - f2)
		else err = Math.abs(f3 - f1 * f2)
		if (query_event('star_policy')) {
			if (-1 === num_stars(err)) {
				// too high... cap it
				const thresh = global_constant.star_policy[query_event('star_policy')]
				err = thresh[thresh.length - 1] / 100
			} else if (3 === num_stars(err)) {
				// quite low... ignore it
				err = 0
			}
		}
		err_total += err
		err_list.push(err)
		//console.log('response', response, 'a', a, 'b', b, 'err', err)
	}
	if (log_entries.length > 0) {
		let average_error = err_total / log_entries.length
		if ('average_error' === query_event('top_right_text')) {
			const average_error_string = (100 * average_error).toFixed(1) + '%'
			doAction.setProp('top_right_text', average_error_string)
		}
		if (!(query_prop('config_iteration') > 1)) {
			//console.log('checking for repeat', num_stars(average_error))
			const policy = query_event('star_policy')
			if (policy && num_stars(average_error) < 1) {
				console.log(
					'REPEAT average_error',
					average_error,
					'num_stars',
					num_stars(average_error),
				)
				// console.log('policy', policy)
				// const thresh = global_constant.star_policy[policy]
				// console.log('thresh', thresh)
				doAction.setProp('repeat_level', 1)
			}
		}
	} else {
		doAction.setProp('top_right_text', null)
	}
	let predicted_error =
		err_total / (log_entries.length + query_prop('config_iteration'))
	let camel_index = 6 - (num_stars(predicted_error) + 2)
	//console.log('err_total', err_total, 'predicted_error', predicted_error, 'camel_index', camel_index)
	//console.log(global_constant.star_policy[query_event('star_policy')], 'err_total', err_total)
	//console.log(log_entries[log_entries.length-1][1])
	const err_box = state.get('err_box')
	let err_box_updated = {}
	//const result = state.getIn(['event_handling', 'result'])
	//const result_name = state.getIn(['name', result])
	//const already_correct = (result_name.size > 1) && (result_name.get(0) === result_name.get(1))
	const nearly_correct =
		err_box && err_box.has('misc') && err_box.getIn(['misc', 'is_thin_height'])
	// console.log('result', result, 'result_name', result_name, 'already_correct', already_correct)
	if (!nearly_correct && err_box.has('position')) {
		// console.log('err_box.position', err_box.get('position'))
		err_box_updated = state.get('err_box').toJS()
		let img_name = 'camel' + camel_index
		let scale = global_constant.camels.camel_scale
		let width = scale * global_constant.camels[img_name].pixel_width
		let height = scale * global_constant.camels[img_name].pixel_height
		err_box_updated.position[0] -=
			global_screen_width -
			(width + global_constant.camels.camel_offsets[0]) +
			global_constant.camels.baggage_offset
		err_box_updated.position[1] -=
			height + global_constant.camels.camel_offsets[1]
		//console.log('err_box_updated.position', err_box_updated.position)
	}
	return {
		camel_index,
		err_list,
		scale_factor: state.getIn(['prop', 'scale_factor']),
		err_box_updated,
		style: ownProps.style,
	}
}

const CamelContainer = connect(mapStateToProps)(Camel)

export default CamelContainer
