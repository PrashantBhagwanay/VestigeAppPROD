import React, { Component } from 'react';
import {
  View,
  Text, 
  TouchableOpacity, 
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import { Specs } from 'app/src/utility/Theme';
import { TrainingTypeEnum } from 'app/src/utility/constant/Constants';

// const data = [
//   {
//     title: TrainingTypeEnum.Training,
//   },
//   {
//     title: TrainingTypeEnum.MyTraining,
//   },
// ];

/**
 * @description It shows all categories for show by category swipe Left
 *              from right
 */
export default class CustomTopTab extends Component<any, any> {

  static propTypes = {
    selectedValue: PropTypes.string,
    data: PropTypes.any,
    handleTabCallback: PropTypes.any
  };

  static defaultProps = {
    selectedValue: '',
    data: [],
    handleTabCallback: this.tabItemClickHandle,
  };

  constructor(props) {
    super(props);
    this.props = props;
  }

  /**
  * @description
  * handling the click of tab buttons
  */
  tabItemClickHandle = (type) => {
    const { handleTabCallback } = this.props;
    handleTabCallback(type)
  }

  handleSelectedTabStyle = () => {
    return this.props.selectedTabStyle || styles.selectedFundsTabContainer;
  }

  handleUnSelectedTabStyle = () => {
    return this.props.unSelectedTabStyle || styles.unSelectedFundsTabContainer;
  }

  handleSelectedTextStyle = () => {
    return this.props.selectedTextStyle || styles.selectedFundsTabTextTitleStyle;
  }

  handleUnSelectedTextStyle = () => {
    return this.props.unSelectedTextStyle || styles.unselectedFundsTabTextTitleStyle;
  }

  render() {
    const { data, selectedValue, style, showTabDivider } = this.props;
    return (
      <View style={[styles.fundsTypeTabContainer, style]}>
        {
          data.map((value, index)=>{
            return(
              <TouchableOpacity 
                key={value.title} 
                style={(value.title === selectedValue) ? this.handleSelectedTabStyle() : this.handleUnSelectedTabStyle()}
                onPress={() => {this.tabItemClickHandle(value.title)}}
              >
                <View style={{ flexDirection: 'row', justifyContent:'space-between', alignItems: 'center' }}>
                  <View />
                  <Text
                    style={(value.title === selectedValue) ? this.handleSelectedTextStyle() : this.handleUnSelectedTextStyle()}
                  >
                    {value.title}
                  </Text>
                  {
                    (showTabDivider && index !== data.length -1) ?
                      ( <View style={styles.selectedFundsTabLeftStyle} />) : <View />
                  }
                </View>
                {/* <View style={(value.title === selectedValue) ?styles.selectedFundsTabHorizontalLine:null} /> */}
              </TouchableOpacity>
            ) 
          })
        }
      </View>
    );
  }
}



const styles = StyleSheet.create({
  fundsTypeTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#c8c9d3',
    borderTopWidth: 0.2,
    height: 60,
    justifyContent:'space-around',
  },
  selectedFundsTabContainer: {
    justifyContent: 'center',
    flex:1,
    borderBottomColor: '#266ac7',
    borderBottomWidth: 5
  },
  unSelectedFundsTabContainer:{
    justifyContent: 'center',
    flex:1,
    borderBottomColor: '#D0DFF9',
    borderBottomWidth: 5
  },
  selectedFundsTabTextTitleStyle: {
    color: '#266ac7',
    alignSelf:'center',
    fontSize:14,
    ...Specs.fontSemibold,
  },
  selectedFundsTabLeftStyle: {
    height: 18,
    width: '1%',
    backgroundColor: '#979797',
  },
  // selectedFundsTabHorizontalLine: {
  //   borderBottomWidth: 2,
  //   borderBottomColor: '#6797d4',
  //   width: '100%',
  //   position: 'absolute',
  //   bottom: 1,
  //   alignSelf:'center',
  // },
  unselectedFundsTabTextTitleStyle: {
    marginLeft: 5,
    color: '#999999',
    marginRight: 5,
    fontSize:14,
    ...Specs.fontMedium,
  },
});