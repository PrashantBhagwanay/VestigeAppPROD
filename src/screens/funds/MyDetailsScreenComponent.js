
import React, { Component } from 'react';
import {  StyleSheet, Text, View, Image, Platform } from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { priceWithCurrencyFunds, capitalizeFirstCharacter, commaSeperateAmount } from 'app/src/utility/Utility';
import { inject, observer } from 'mobx-react';

const GHANACURRENCY_ICON = require('app/src/assets/images/myFunds/cedi.png')

@inject('checkout','profile', 'cart', 'auth')
@observer
export default class MyDetailsScreenComponent extends Component {
  
  constructor(props){
    super(props)
  }
 
  render() {
    const { details } = this.props;
    return ( 
      <View> 
        <View style={styles.mainView} onPress={() => this.showdetails()}>
          <View style={styles.textRow}>
            <Text style={styles.businessMonthText}>{details.businessMonth}</Text>
               {
                this.props.profile.countryId == 24 ? (
                  <View style={{ flexDirection: 'row', }}>
                    <Image source={GHANACURRENCY_ICON} style={{ tintColor: '#31cab3', height: 16, width: 16, marginRight: 0, marginTop: Platform.OS === 'ios' ? 18 : 20 }} />
                    <Text style={styles.openingText}>
                      {details.newFund ? commaSeperateAmount(details.newFund) : 0}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.openingText}>
                    {priceWithCurrencyFunds(details.currencyCode?details.currencyCode:this.props.profile.countryId,commaSeperateAmount(details.newFund))}
                  </Text> 
                )
                }
          </View>
          <Text style={styles.remarksText}>{capitalizeFirstCharacter(details.remarks)}</Text>
        </View>
        <View style={styles.seperator} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainView: {
    marginHorizontal:16
  },
  seperator: {
    borderWidth:1,
    borderColor:'#e8e9ed',
    marginTop:8
  },
  remarksText:{
    color:'#8b8b8b',
    fontSize:14,
    ...Specs.fontRegular,
  },
  openingText:{
    color:'#31cab3',
    marginTop:18,
    fontSize:14,
    ...Specs.fontSemibold,
  },
  businessMonthText: {
    color:'#414456',
    fontSize:14,
    ...Specs.fontMedium,
  },
  textRow:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginTop:8
  }
});