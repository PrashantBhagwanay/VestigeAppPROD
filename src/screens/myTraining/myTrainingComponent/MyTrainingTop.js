import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MyTrainingTypeEnum } from 'app/src//utility/constant/Constants';
import { Specs } from 'app/src/utility/Theme';
/**
 * @description It shows all top view of Training screen
 */
export default class MyTrainingTop extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedType: MyTrainingTypeEnum.Approved,
    };
    this.props = props;
  }

  /**
  * @description
  * handling the click of buttons
  */
  itemClickHandle = (type) => {
    const {  selectedType } = this.state;
    const {  handleFilterCallback } = this.props;
    if(type!==selectedType){
      this.setState({
        selectedType:type,
      })
      handleFilterCallback(type)
    }
  }

  getTopView = (type) => {
    const {  selectedType } = this.state;
    if(type==selectedType){
      return (
        <TouchableOpacity 
          style={[styles.itemView, styles.selectedStatusView]}
          onPress={() => this.itemClickHandle(type)}
        >
          <Text style={[styles.title, styles.selectedTitle]}>
            {type}
          </Text>
        </TouchableOpacity>
      )
    } 
    else {
      return (
        <TouchableOpacity
          style={[styles.itemView,styles.unSelectedStatusView]}
          onPress={() => this.itemClickHandle(type)}
        >
          <Text style={[styles.title, styles.unSelectedTitle]}>
            {type}
          </Text>
        </TouchableOpacity>
      )
    }
  }

  render() {
    return(
      <View style={styles.mainView}>
        <ScrollView 
          style={styles.titleView} 
          horizontal 
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps='always'
        >
          {this.getTopView(MyTrainingTypeEnum.Approved)}
          {this.getTopView(MyTrainingTypeEnum.Pending)}
          {this.getTopView(MyTrainingTypeEnum.Closed)}
          {this.getTopView(MyTrainingTypeEnum.Rejected)}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    width: '100%',
    height: 60,
    marginBottom: 5,
  },
  titleView: {
    width: '100%',
    height: 58,
    flexDirection: 'row',
    backgroundColor: '#f2f5f8',
  },
  itemView: {
    width: 100,
    height: 30,
    justifyContent: 'center',
    marginLeft: 15,
    marginVertical: 20,
    borderRadius: 15,
    paddingHorizontal: 10,
  },
  selectedStatusView: {
    backgroundColor: '#4a90e2',
  },
  unSelectedStatusView: {
    borderWidth: 1,
    borderColor: '#979797'
  },
  title: {
    width: '100%',
    fontSize: 15,
    textAlign: 'center',
  },
  selectedTitle: {
    color: '#ffffff',
    ...Specs.fontSemibold,
  },
  unSelectedTitle: {
    color: '#868c95',
    ...Specs.fontMedium,
  },
});