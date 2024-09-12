import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Banner from '../../Dashboard/Banner';
import { Specs } from '../../../utility/Theme';
const SELECTED_STAR = require('../../../assets/images/consistency/selectedStar.png');
const UNSELECTED_STAR = require('../../../assets/images/consistency/unselectedStar.png');

export default class ConsistencyStarComponent extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  createStar = (imageSource, starCount, index) => {
    return (
      <View key={index.toString()}>
        <Banner
          styles={styles.imageStyle}
          resizeMode="contain"
          source={imageSource}
        />
        <Text style={styles.starCount}>{starCount}</Text>
      </View>
    )
  }

  getStarsData = (consistencyData) => {
    if(consistencyData){
      return (
        consistencyData.map((item,index) => {
          if (item >= 4) {
            return (this.createStar(SELECTED_STAR, item, index))
          }
          return (this.createStar(UNSELECTED_STAR, item, index))
        })
      )
    }
  }
  render() {
    const { cncDataList } = this.props;
    return (
      <View style={styles.mainView}>
        <View style={styles.starView}>
          {
            this.getStarsData(cncDataList)
          }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#ffffff',
    paddingBottom: 5,
    marginTop: 7,
    marginBottom: 9,
    flexDirection: 'column',
  },
  starView: {
    justifyContent: 'center',
    marginTop:'5%',
    flexDirection:'row',
  },
  imageStyle: {
    height: 40,
    width: 40,
    marginRight: 9
  },
  starCount: {
    ...Specs.fontRegular,
    position:'absolute', 
    bottom: 25, 
    left:16, 
    fontSize:14,
    color: '#373e73'
  }
});
