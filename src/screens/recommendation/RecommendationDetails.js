import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { observer, inject } from 'mobx-react';
import Loader  from 'app/src/components/loader/Loader';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Specs } from 'app/src/utility/Theme';
import { commaSeperateAmount } from 'app/src/utility/Utility';
import { strings } from 'app/src/utility/localization/Localized';
import { Header } from '../../components';
const horizontalLine= require('app/src/assets/images/HorizontalLine.png')

@inject('recommendation')
@observer
export default class RecommendationDetails extends Component {

  async componentDidMount(){
  }

  constructor(props){
    super(props);
  }

  render(){
    const { isLoading,recommendationData } = this.props.recommendation;
    if(this.props.route.params.type === 'desiredLevel') {
      return(
        <>
          <Loader loading={isLoading} />
          <Header
            navigation={this.props.navigation}
            screenTitle={strings.recommendation.detailsTitle}
          />
          <View style={styles.mainView}>
            <View style={styles.details}>
              <Text style={[styles.textLeft,{color:'#2b55a4'}]}>{strings.recommendation.totalPv}</Text>
              <Text style={[styles.textRight,{color:'#2063e1'}]}>{commaSeperateAmount(recommendationData.totalCumPV)}</Text>
            </View>
            <Image source={horizontalLine} style={styles.horizontalLine} />        
            <View style={styles.details}>
              <Text style={[styles.textLeft,{color:'#fe7f3a'}]}>{strings.recommendation.qualifiedLeg}</Text>
              <Text style={[styles.textRight,{color:'#fe7f3a'}]}>{commaSeperateAmount(recommendationData.qualifiedLegCount)}</Text>
            </View>  
            <View style={styles.details}>
              <Text style={[styles.textLeft,{color:'#fe7f3a'}]}>{strings.recommendation.targetLeg}</Text>
              <Text style={[styles.textRight,{color:'#fe7f3a'}]}>{commaSeperateAmount(recommendationData.requiredQualifiedLegCount)}</Text>
            </View>
            <Image source={horizontalLine} style={styles.horizontalLine} />        
            <View style={styles.details}>
              <Text style={[styles.textLeft,{color:'#1db594'}]}>{strings.recommendation.currentMaintain}</Text>
              <Text style={[styles.textRight,{color:'#1db594'}]}>{commaSeperateAmount(recommendationData.sideMaintainence)}</Text>
            </View>  
            <View style={styles.details}>
              <Text style={[styles.textLeft,{color:'#1db594'}]}>{strings.recommendation.targetMaintain}</Text>
              <Text style={[styles.textRight,{color:'#1db594'}]}>{commaSeperateAmount(recommendationData.requiredQualifiedSideMaintenance)}</Text>
            </View>
          </View>
        </>
      ) 
    }
    else {
      return (
        <>
          <Loader loading={isLoading} />
          <Header
            navigation={this.props.navigation}
            screenTitle={strings.recommendation.detailsTitle}
          />
          <View style={styles.mainView}>
            <View style={styles.details}>
              <Text style={[styles.textLeft,{color:'#2b55a4'}]}>{strings.recommendation.currentPv}</Text>
              <Text style={[styles.textRight,{color:'#2063e1'}]}>
                {recommendationData.currentCumulativePV ? commaSeperateAmount(recommendationData.currentCumulativePV): 0 }
              </Text>
            </View>  
            <View style={styles.details}>
              <Text style={[styles.textLeft,{color:'#2b55a4'}]}>{strings.recommendation.existingBonus}</Text>
              <Text style={[styles.textRight,{color:'#2063e1'}]}>
                {recommendationData.existingBonusPercent ? commaSeperateAmount(recommendationData.existingBonusPercent) : 0  }
              </Text>
            </View>
            <View style={styles.details}>
              <Text style={[styles.textLeft,{color:'#2b55a4'}]}>{strings.recommendation.shortPoint}</Text>
              <Text style={[styles.textRight,{color:'#2063e1'}]}>
                {recommendationData.shortPoint ? commaSeperateAmount(recommendationData.shortPoint) : 0  }
              </Text>
            </View>
          </View>
        </>
      )
    }
    
  }

}

const styles=StyleSheet.create({
  mainView:{
    backgroundColor:'#fff',
    flex:1,
    paddingLeft:32,
    paddingRight:39,
    paddingTop:37
  },
  details:{
    flexDirection:'row',
    justifyContent:'space-between',
  },
  textLeft:{
    marginBottom:7,
    ...Specs.fontMedium,
    fontSize:12,
  },
  textRight:{
    marginBottom:5,
    ...Specs.fontMedium,
    fontSize:16,
  },
  horizontalLine:{
    width:'100%',
    marginTop:6,
    marginBottom:21
  }
})