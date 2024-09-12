/**
 * @description MyFunds Screen where user can see Car Funds, House Funds & Travel Funds
*/

import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';

import MyDetailsScreenComponent from 'app/src/screens/funds/MyDetailsScreenComponent';
import FundsList from 'app/src/screens/funds/component/fundsList';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { inject, observer } from 'mobx-react';
import { Header } from '../../components';

@inject('profile')
@observer
class MyFunds extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { data } = this.props.route.params;
    return (
      <View style={styles.container}>
        <Header
          navigation={this.props.navigation}
          screenTitle={this.props.route.params.title}
        />
        {data.length > 0 ? (
          <View>
            <FundsList countryId={this.props.profile.countryId} fundsDataList={data[0]} />
            <Text style={styles.heading}>
              {strings.myFund.detailsHeading.toUpperCase()}
            </Text>
          </View>
        ) : null}
        <FlatList
          keyExtractor={(item, index) => item + index}
          showsVerticalScrollIndicator={false}
          style={{ marginTop:8 ,backgroundColor:'#ffffff'}}
          data={data}
          renderItem={({ item ,index }) => {
            return <MyDetailsScreenComponent key={index} details={item} />;
          }}
        />
      </View>
    );
  }
}

export default MyFunds;

const styles=StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF3F7',
  },
  heading:{
    marginTop:21,
    marginLeft:16,
    color:'#3f4967',
    fontSize:12,
    ...Specs.fontSemibold,
  }
});