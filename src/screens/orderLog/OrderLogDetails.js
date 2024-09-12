import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { inject, observer } from 'mobx-react';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Toast } from 'app/src/components/toast/Toast';
import Loader from 'app/src/components/loader/Loader';
import autobind from 'autobind-decorator';
import { observable, makeObservable} from 'mobx';
import { priceWithCurrency, connectedToInternet } from 'app/src/utility/Utility';
import { strings } from 'app/src/utility/localization/Localized';
import Banner from 'app/src/screens/Dashboard/Banner';
import OfflineNotice from 'app/src/components/OfflineNotice';
import { Header } from '../../components';

const PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');
const COLORED_RATING_ICON = require('app/src/assets/images/coloured_Star.png')


@inject('cart', 'profile','auth','products')
@observer
export default class OrderLogDetails extends Component {
  @observable isProductDetailFetched: Boolean = false;
  @observable orderObject;
  @observable isInternetConnected: Boolean = true;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.orderObject = this.props.route.params.item;
    this.state = {
      isLoading: false,
      productsList: [],
    }
    this.isRepeatButtonShow = false
  }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    if (this.isInternetConnected) {
      await this.getComponentData()
    }
  }

  @autobind
  async networkStatus(status) {
    if (status) {
      this.isInternetConnected = status;
      await this.getComponentData()
    }
  }

  @autobind
  async getComponentData() {
    this.setState({ isLoading: true })
    const isApiV2 = this.orderObject?.orderCreatedBy === 'Web_V2';
    this.isProductDetailFetched = await this.props.cart.getOrderDetails(this.orderObject.customerOrderNo, this.orderObject.invoiceNo, this.orderObject.logNo, isApiV2);
    this.setState({ 
      productsList: this.props.cart.productItemsList,
      isLoading: false 
    })
    if (!this.isProductDetailFetched) {
      this.showToast(strings.commonMessages.noProductRelated, Toast.type.ERROR)
    }
  }

  @autobind
  showToast(message: string, toastType: Toast.type) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  renderProducts = (item, index) => {
    const isDubaiOders = item.hasOwnProperty('countryId') ? item?.countryId : false
    return (
      <View>
        <View>
          <View style={styles.itemCard}>
            <View style={{ flexDirection: 'row', flex: 1, paddingBottom: 10, backgroundColor: 'white', paddingTop: 10 }}>
              <View style={styles.shadowContainer}>
                <View style={{ width: '100%', height: '100%', backgroundColor: 'white', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                  <Banner
                    styles={styles.itemImage}
                    resizeMode="contain"
                    source={item.url ? { uri: item.url } : PLACEHOLDER}
                  />
                </View>
              </View>

              <View style={{ flex: 2, paddingHorizontal: 10, justifyContent: 'center' }}>
                <Text numberOfLines={2} style={styles.itemName}>{item.productName}</Text>
                <Text style={[styles.itemName, { paddingTop: 5 }]}>
                  {'Qty: '}
                  <Text style={styles.price}>
                    {item.quantity}
                  </Text>
                </Text>
                <Text style={[styles.itemName, { paddingTop: 5 }]}>
                  {'Item Code: '}
                  <Text style={styles.price}>
                    {item.skuCode}
                  </Text>
                </Text>
                <Text style={[styles.itemName, { paddingTop: 5 }]}>
                  {'Is Promotion Item: '}
                  <Text style={styles.price}>
                    {item.isPromo}
                  </Text>
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <View style={{flex:1,height:'30%',alignItems:'center',justifyContent:'center'}}>
                  <Text style={styles.price}>
                    {`${priceWithCurrency(this.orderObject.countryId, item.productAmount)}`}
                  </Text>
                  {isDubaiOders && item.skuCode !== 'AECR001' && <Text style={styles.excludingTax}>{'(Excluding VAT)'}</Text> }
                  
                </View>
              </View>
            </View>
            { (item.averageRating != "0.0" && item.averageRating != "0" && item.averageRating != null && item.averageRating != undefined  && (this.orderObject.distributorId == this.props.auth.distributorID))
              ?
              (
                <View style={[styles.ratingStatus]}>
                  <Text style={[styles.ratingStatusText, {color: '#349e4d'}]}>{`${strings.order.orderDetails.orderAlreadyProduct}${item.averageRating}`}</Text>
                  <Banner
                    styles={[styles.ratingIcon, {top:0}]}
                    resizeMode="contain"
                    source={COLORED_RATING_ICON}
                  />
                </View>
              )
              : null
            }
          </View>
        </View>
        <View style={{height:1, backgroundColor: '#DDDDDD'}} />
      </View>
    )
  } 

  render() {
    return (
      <View style={{ flex: 1 }}>
        {!this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} />}
        <Loader loading={this.state.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={`${strings.order.orderDetails.heading}`}
        />
        {
          this.isProductDetailFetched ? (
            <View style={styles.container}>
              <Text style={styles.titleContainer}>{strings.order.orderDetails.productName}</Text>
              <FlatList
                contentContainerStyle={{ paddingBottom: 20 }}
                style={{ marginTop: 10, marginBottom: 60 }}
                data={this.state.productsList}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item, index }) => this.renderProducts(item, index)}
              />
            </View>
          ) : null
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  titleContainer: {
    color: '#373e73',
    marginBottom: 8,
    ...Specs.fontMedium
  },
  container: {
    paddingTop: 13,
    paddingHorizontal: 18,
    backgroundColor: 'transparent',
    flex: 1
  },
  price: {
    justifyContent: 'flex-end',
    color: '#31cab3',
    ...Specs.fontSemibold,
  },
  excludingTax: {
    justifyContent: 'flex-end',
    color: '#31cab3',
    ...Specs.fontRegular,
    fontSize: 10,
  },
  itemName: {
    color: '#6c7a87',
    fontSize: 12,
    ...Specs.fontMedium
  },
  itemCard: {
    flexDirection: 'row',
    flex: 1,
  },
  itemImage: {
    height: 60,
    width: 50,
    marginRight: 12
  },
  itemName: {
    color: 'rgba(0,0,0,0.8)',
    fontSize: 14,
    ...Specs.fontMedium
  },
  itemCard: {
    flexDirection: 'column',
    flex: 1,
  },
  shadowContainer: {
    height: 60,
    width: 60,
    elevation: 2,
    borderRadius: 20,
    shadowOffset: { width: 1, height: 2 },
    shadowColor: 'gray',
    shadowOpacity: 0.7,
    shadowRadius: 5,
    margin: 10
  },
  itemImage: {
    height: 50,
    width: 50,
    borderRadius: 5,
  },
  ratingStatusText: {
    ...Specs.fontMedium,
    fontSize:12,
    color:'#6c7a87'
  },
  ratingStatus: {
    flexDirection:'row',
    justifyContent: 'flex-end',
    alignItems : 'center',
    alignContent: 'center',
    paddingRight : 10,
    backgroundColor: 'white',
    paddingVertical: 3,
  },
  ratingIcon: {
    height: 15,
    width: 15,
    marginHorizontal: 2,
    alignSelf: 'baseline'
  },
})    