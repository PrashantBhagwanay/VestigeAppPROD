
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import { priceWithCurrencyFunds, capitalizeFirstCharacter, commaSeperateAmount } from 'app/src/utility/Utility';

const GHANACURRENCY_ICON = require('app/src/assets/images/myFunds/cedi.png')

const fundsList = (params) => {
  const {fundsDataList,countryId} = params;
  const {fundDetailKeys} = strings.myFund;
  return(
    <View style={styles.listComponentContainer}>
      <View style={{marginVertical:10}}>
        <View style={styles.textRowContainer}>
          <Text style={styles.leftTextStyle}>
            {fundDetailKeys.Opening}
          </Text>
          {
            countryId == 24 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 2, }}>
                <Image source={GHANACURRENCY_ICON} style={{ tintColor: '#373e73', height: 16, width: 16, marginRight: 0 }} />
                <Text style={styles.rightTextStyle}>
                  {fundsDataList.opening ? commaSeperateAmount(fundsDataList.opening) : 0}
                </Text>
              </View>
            ) : (
              <Text style={styles.rightTextStyle}>
                {priceWithCurrencyFunds(fundsDataList.currencyCode?fundsDataList.currencyCode:countryId,commaSeperateAmount(fundsDataList.opening))}
              </Text> 
            )
            }
        </View>
        <View style={styles.textRowContainer}>
          <Text style={styles.leftTextStyle}>
            {fundDetailKeys.Balance}
          </Text>
          {
            countryId == 24 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 2, }}>
                <Image source={GHANACURRENCY_ICON} style={{ tintColor: '#373e73', height: 16, width: 16, marginRight: 0 }} />
                <Text style={styles.rightTextStyle}>
                  {fundsDataList.balance ? commaSeperateAmount(fundsDataList.balance) : 0}
                </Text>
              </View>
            ) : (
              <Text style={styles.rightTextStyle}>
                {priceWithCurrencyFunds(fundsDataList.currencyCode?fundsDataList.currencyCode:countryId,commaSeperateAmount(fundsDataList.balance))}
              </Text> 
            )
            }
        </View>
        <View style={styles.textRowContainer}>
          <Text style={styles.leftTextStyle}>
            {fundDetailKeys.Paid}
          </Text>
          {
            countryId == 24 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 2, }}>
                <Image source={GHANACURRENCY_ICON} style={{ tintColor: '#373e73', height: 16, width: 16, marginRight: 0 }} />
                <Text style={styles.rightTextStyle}>
                  {fundsDataList.paid ? commaSeperateAmount(fundsDataList.paid) : 0}
                </Text>
              </View>
            ) : (
              <Text style={styles.rightTextStyle}>
                {priceWithCurrencyFunds(fundsDataList.currencyCode?fundsDataList.currencyCode:countryId,commaSeperateAmount(fundsDataList.paid))}
              </Text> 
            )
            }
        </View>
        <View style={styles.textRowContainer}>
          <Text style={styles.leftTextStyle}>
            {fundDetailKeys.New}
          </Text>
          {
            countryId == 24 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 2, }}>
                <Image source={GHANACURRENCY_ICON} style={{ tintColor: '#373e73', height: 16, width: 16, marginRight: 0 }} />
                <Text style={styles.rightTextStyle}>
                  {fundsDataList.newFund ? commaSeperateAmount(fundsDataList.newFund) : 0}
                </Text>
              </View>
            ) : (
              <Text style={styles.rightTextStyle}>
                {priceWithCurrencyFunds(fundsDataList.currencyCode?fundsDataList.currencyCode:countryId,commaSeperateAmount(fundsDataList.newFund))}
              </Text> 
            )
            }
        </View>
        <View style={[styles.textRowContainer]}>
          <Text style={styles.leftTextStyle}>
            {fundDetailKeys.Remark}
          </Text>
          <Text style={styles.rightTextStyle}>{capitalizeFirstCharacter(fundsDataList.remarks)}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  listComponentContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  textRowContainer: {
    flexDirection: 'row',
    marginLeft: 18,
    marginVertical: 4,
  },
  leftTextStyle: {
    color: '#3f4967',
    fontSize: 12,
    flex: 1,
    ...Specs.fontRegular,
  },
  rightTextStyle: {
    color: '#373e73',
    fontSize: 16,
    flex: 2,
    ...Specs.fontMedium,
  },
});

export default fundsList;

