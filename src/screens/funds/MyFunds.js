import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { observer, inject } from 'mobx-react';
import Banner from 'app/src/screens/Dashboard/Banner';
import Loader from 'app/src/components/loader/Loader';
import { MYFUND_CONSTANT } from 'app/src/utility/constant/Constants';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import { priceWithCurrencyFunds, commaSeperateAmount, connectedToInternet } from 'app/src/utility/Utility';
import OfflineNotice from 'app/src/components/OfflineNotice';
import { observable, makeObservable } from 'mobx';
import autobind from 'autobind-decorator';

// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Header } from '../../components';

const Forward_ICON = require('app/src/assets/images/productDetails/forward_icon.png');
const CARFUND_ICON = require('app/src/assets/images/myFunds/carFundIcon.png');
const HOUSEFUND_ICON = require('app/src/assets/images/myFunds/houseFund.png');
const TRAVELFUND_ICON = require('app/src/assets/images/myFunds/travelFund.png');
const GHANACURRENCY_ICON = require('app/src/assets/images/myFunds/cedi.png');

@inject('myFunds', 'profile')
@observer
class MyFunds extends Component {

  @observable isInternetConnected: Boolean = true;

  constructor(props) {
    super(props)
    makeObservable(this);
    this.state = {
    }
  }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    this.isInternetConnected && await this.props.myFunds.fetchFundsData()
  }

  @autobind
  async networkStatus(status) {
    if (status) {
      this.isInternetConnected = status;
      await this.props.myFunds.fetchFundsData()
    }
  }

  render() {
    const { navigation, myFunds } = this.props
    const { fundTypes } = strings.myFund
    const { fundType } = MYFUND_CONSTANT

    return (
      <View style={{ flex: 1 }}>
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.myFund.screenTitle}
        />
        {!this.isInternetConnected ? (
          <OfflineNotice networkStatus={(status) => this.networkStatus(status)} />
        ) : (
          <View style={{ flex: 1 }}>
            <Loader loading={myFunds.isLoading} />
            {!myFunds.isLoading && (
              <TouchableOpacity
                onPress={() => navigation.navigate('myFundsDetails',
                  { title: fundTypes.carFund.title, data: myFunds[fundType.carFund.type] })}
                style={styles.barView}
              >
                <View style={{ flexDirection: 'row', marginLeft: 17 }}>
                  <Banner
                    styles={styles.fundsIcon}
                    resizeMode='contain'
                    source={CARFUND_ICON}
                  />
                  <View style={{ marginLeft: 32 }}>
                    <Text style={styles.barViewtext}>
                      {fundTypes.carFund.displayName}
                    </Text>
                    {
                      this.props.profile.countryId == 24 ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Image source={GHANACURRENCY_ICON} style={{ tintColor: '#31cab3', height: 16, width: 16 }} />
                          <Text style={styles.barPricetext}>
                            {myFunds[fundType.carFund.type].length > 0 ? commaSeperateAmount(myFunds[fundType.carFund.type][0].opening) : 0}
                          </Text>

                        </View>
                      ) : (
                        <Text style={styles.barPricetext}>
                          {priceWithCurrencyFunds(myFunds[fundType.carFund.type][0]?.currencyCode? myFunds[fundType.carFund.type][0]?.currencyCode:this.props.profile.countryId, (myFunds[fundType.carFund.type].length > 0) ? commaSeperateAmount(myFunds[fundType.carFund.type][0].opening) : 0)}
                        </Text>
                      )
                    }
                  </View>
                </View>
                <Banner
                  styles={styles.forwardIcon}
                  resizeMode='contain'
                  source={Forward_ICON}
                />
              </TouchableOpacity>
            )}
            {!myFunds.isLoading && (
              <TouchableOpacity
                onPress={() => navigation.navigate('myFundsDetails',
                  { title: fundTypes.houseFund.title, data: myFunds[fundType.houseFund.type] })}
                style={styles.barView}
              >
                <View style={{ flexDirection: 'row', marginLeft: 17 }}>
                  <Banner
                    styles={{ height: 46, width: 47 }}
                    resizeMode='contain'
                    source={HOUSEFUND_ICON}
                  />
                  <View style={{ marginLeft: 32 }}>
                    <Text style={styles.barViewtext}>
                      {fundTypes.houseFund.displayName}
                    </Text>
                    {
                      this.props.profile.countryId == 24 ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Image source={GHANACURRENCY_ICON} style={{ tintColor: '#31cab3', height: 16, width: 16 }} />
                          <Text style={styles.barPricetext}>
                            {myFunds[fundType.houseFund.type].length > 0 ? commaSeperateAmount(myFunds[fundType.houseFund.type][0].opening) : 0}
                          </Text>

                        </View>
                      ) : (
                        <Text style={styles.barPricetext}>
                          {priceWithCurrencyFunds(myFunds[fundType.houseFund.type][0]?.currencyCode? myFunds[fundType.houseFund.type][0]?.currencyCode:this.props.profile.countryId, (myFunds[fundType.houseFund.type].length > 0) ? commaSeperateAmount(myFunds[fundType.houseFund.type][0].opening) : 0)}
                        </Text>
                      )
                    }
                  </View>
                </View>
                <Banner
                  styles={styles.forwardIcon}
                  resizeMode='contain'
                  source={Forward_ICON}
                />
              </TouchableOpacity>
            )}
            {!myFunds.isLoading && (
              <TouchableOpacity
                onPress={() => navigation.navigate('myFundsDetails',
                  { title: fundTypes.travelFund.title, data: myFunds[fundType.travelFund.type] })}
                style={styles.barView}
              >
                <View style={{ flexDirection: 'row', marginLeft: 17 }}>
                  <Banner
                    styles={{ height: 46, width: 47 }}
                    resizeMode='contain'
                    source={TRAVELFUND_ICON}
                  />
                  <View style={{ marginLeft: 32 }}>
                    <Text style={styles.barViewtext}>
                      {fundTypes.travelFund.displayName}
                    </Text>
                    {
                      this.props.profile.countryId == 24 ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Image source={GHANACURRENCY_ICON} style={{ tintColor: '#31cab3', height: 16, width: 16 }} />
                          <Text style={styles.barPricetext}>
                            {myFunds[fundType.travelFund.type].length > 0 ? commaSeperateAmount(myFunds[fundType.travelFund.type][0].opening) : 0}
                          </Text>

                        </View>
                      ) : (
                        <Text style={styles.barPricetext}>
                          {priceWithCurrencyFunds(myFunds[fundType.travelFund.type][0]?.currencyCode? myFunds[fundType.travelFund.type][0].currencyCode:this.props.profile.countryId, (myFunds[fundType.travelFund.type].length > 0) ? commaSeperateAmount(myFunds[fundType.travelFund.type][0].opening) : 0)}
                        </Text>
                      )
                    }
                  </View>
                </View>
                <Banner
                  styles={styles.forwardIcon}
                  resizeMode='contain'
                  source={Forward_ICON}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }
}
export default MyFunds;

const styles = StyleSheet.create({
  forwardIcon: {
    width: 15,
    height: 18,
    resizeMode: 'contain',
    marginHorizontal: 16
  },
  barView: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 78
  },
  barViewtext: {
    color: '#414456',
    fontSize: 14,
    ...Specs.fontMedium,
  },
  barPricetext: {
    color: '#31cab3',
    fontSize: 16,
    ...Specs.fontMedium,
  },
  fundsIcon: {
    height: 46,
    width: 47
  }
});