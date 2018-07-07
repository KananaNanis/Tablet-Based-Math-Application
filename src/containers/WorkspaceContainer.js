import { connect } from 'react-redux'
import Workspace from '../components/Workspace'
import { consolidate_nums } from '../providers/query_store'

const mapStateToProps = (state, ownProps) => {
  //console.log(ownProps)
  return {
    style: ownProps.style,
    scale_factor: state.scale_factor,
    keypad_kind: state.keypad_kind,
    button_highlight: state.button_highlight,
    all_nums: consolidate_nums(state.num_ids,
      state.num_name,
      state.num_position,
      state.num_style,
      state.num_tower_style,
      state.num_block_opacity,
      state.num_misc)
  }
}

const mapDispatchToProps = dispatch => {
  return {}
}

const WorkspaceContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Workspace)

export default WorkspaceContainer
