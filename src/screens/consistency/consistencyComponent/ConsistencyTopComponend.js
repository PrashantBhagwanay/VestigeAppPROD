
import React, { Component } from 'react';
import { Text, View, StyleSheet,TouchableOpacity } from 'react-native';
import { ConsistancyEnum } from '../../../utility/constant/Constants'

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#ffffff',
    height: 56,
  },
  bottomView: {
    height: 56,
    flex: 1,
    flexDirection: 'row',
  },
  bottomSubView: {
    flex: 0.5,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sepratorView: {
    height: 2,
    width: '100%',
    backgroundColor: '#6797d4',
    marginTop: 15,
  },
  sepratorWithWhiteView: {
    height: 2,
    width: '100%',
    backgroundColor: 'transparent',
    marginTop: 15,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6797d4',
  },
  unSelectedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#cbcbcb',
  },
  viewSeprator: {
    marginTop: 20,
    height: 18,
    width: 1,
    backgroundColor: '#979797',
  },
});

export default class ConsistencyTopComponend extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }
  render() {
    const { isHistory } = this.props
    return (
      <View style={styles.mainView}>
        <View style={styles.bottomView}>
          <TouchableOpacity 
            style={styles.bottomSubView}
            onPress={() => this.props.handleTopClick(ConsistancyEnum.Achieved)}
          >
            <Text style={isHistory == false ? styles.selectedText : styles.unSelectedText}>Achieved</Text>
            <View style={isHistory == false ? styles.sepratorView : styles.sepratorWithWhiteView} />
          </TouchableOpacity>
          <View style={styles.viewSeprator} />
          <TouchableOpacity 
            style={styles.bottomSubView}
            onPress={() => this.props.handleTopClick(ConsistancyEnum.History)}
          >
            <Text style={isHistory == true  ? styles.selectedText : styles.unSelectedText}>History</Text>
            <View style={isHistory == true ? styles.sepratorView : styles.sepratorWithWhiteView} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}