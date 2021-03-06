import React from 'react';
import {
  StyleSheet,
  Text,
  Button,
  View,
} from 'react-native-web';
import {connect} from 'react-redux';
import actions from '../actions';

class App extends React.Component {

  render() {
    return (
      <View style={styles.container}>
        <Text>
          Backend port: {this.props.backendPort}!
        </Text>
        <Text>
          Foo bar
        </Text>
        <Button onPress={this.props.buttonPressed} title={'Test'}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  }
});

const mapStateToProps = (state) => ({
  backendPort: state.backendPort,
});

const mapDispatchToProps = (dispatch, state) => ({
  buttonPressed: () => {
    dispatch(actions.testService.testCommand.request({integer:4,array:[4,8,12],string:"four",map:{d:[4,3,2,1]}}));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
