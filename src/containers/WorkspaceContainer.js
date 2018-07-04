import { connect } from 'react-redux'
import Workspace from '../components/Workspace'

const consolidateNums = (ids, name, position, style, misc) => {
  let res = [];
  for(const id of ids) {
    res.push({id,
              name : name[id],
              position : position[id],
              style : style[id],
              misc : misc[id]
    })
  }
  return res;
}

const mapStateToProps = (state, ownProps) => {
  //console.log(ownProps);
  return {
    style: ownProps.style,
    scale_factor: state.scale_factor,
    num_desc: consolidateNums(state.num_ids,
                              state.num_name,
                              state.num_position,
                              state.num_style,
                              state.num_misc)
  }
}

const mapDispatchToProps = dispatch => {
  return {
  }
}

const WorkspaceContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Workspace)

export default WorkspaceContainer
