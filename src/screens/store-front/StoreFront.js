import React, { Component } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { inject, observer } from 'mobx-react';
import { observable, makeObservable} from 'mobx';
import autobind from 'autobind-decorator';
import { Specs } from 'app/src/utility/Theme';
import { connectedToInternet } from 'app/src/utility/Utility';

// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';

import ShopByPv from 'app/src/screens/Dashboard/Shopbypv';
import { strings } from 'app/src/utility/localization/Localized';
import SidescrollComponent from 'app/src/components/sidescrollComponent/SidescrollComponent';
import BannerView from 'app/src/components/dashBoard/BannerView';
import Loader from 'app/src/components/loader/Loader';
import OfflineNotice from 'app/src/components/OfflineNotice';
import LocationHeader from 'app/src/components/locationHeader/LocationHeader'
import SubCategory from '../Dashboard/components/SubCategory';
import { Header } from '../../components';

const PVRANGE = '0-25';

@inject('dashboard','products', 'cart', 'profile')
@observer
export default class StoreFront extends Component {
  @observable isInternetConnected: Boolean = true;
  @observable bannerData: Array<any> = [];
  @observable isNewLaunch: [];
  @observable mostViewed: [];
  @observable topSelling: [];

  constructor(props) {
    super(props);
    makeObservable(this);
    this.props = props;
    if(props.route.params.data.categoryId){
      this.extraData = `categoryId=${props.route.params.data.categoryId}`
      this.bannerQuery = `categoryId=${props.route.params.data.categoryId},bannerType=CATEGORY,status=true,isPopup=false` 
    }
    else if(props.route.params.data.brandId){
      this.extraData = `brand.brandId=${props.route.params.data.brandId}`
      this.bannerQuery = `brandId=${props.route.params.data.brandId},bannerType=BRAND,status=true,isPopup=false` 
    }
  }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    if(this.isInternetConnected) {
      this.callAPIS();
    }
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
      this.callAPIS();
    }
  }

  async callAPIS(){
    this.bannerData = await this.props.products.getBannerForStoreFront(this.bannerQuery)
    await this.props.products.updatePvRange(PVRANGE)
    await this.props.products.fetchProductWidget('shopByPv', PVRANGE, this.extraData);
    this.isNewLaunch = await this.props.products.fetchProductWidgetStoreFront('isNewLaunch', '', this.extraData);
    this.mostViewed = await this.props.products.fetchProductWidgetStoreFront('mostViewed', '', this.extraData); 
    this.topSelling = await this.props.products.fetchProductWidgetStoreFront('topSelling', '', this.extraData); 
  }

  render() {
    const { navigation, products } = this.props;
    const { data } = this.props.route.params;
    const flagCategoryBranchShow = this.props.profile.countryId == 1 ? true : this.props.profile.isCategoryBrandBannersShow;
    const showlocationFlag = this.props.profile.countryId == 1 ? true : this.props.profile.location_update;
    return (
      <View style={styles.mainView}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        {/* <Loader loading={isLoading} /> */}
        <Header
          navigation={this.props.navigation}
          screenTitle={this.props.route?.params?.data?.name}
        />
        {(showlocationFlag == true) && <LocationHeader navigation={this.props.navigation} /> }
        <ScrollView keyboardShouldPersistTaps='always'>
          {flagCategoryBranchShow == true && this.bannerData && this.bannerData.length > 0 &&  <BannerView countryId={this.props.profile.countryId} navigation={navigation} bannerData={this.bannerData} />}
          <TouchableOpacity
            onPress={()=> this.props.navigation.navigate('productList', {title: this.props.route.params.data.name, type:'banner', param: this.extraData})} 
            style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'row',alignItems: 'center', paddingRight: 15, marginTop: 15}}
          > 
            <Text style={styles.viewAllProducts}>View all Products</Text>
          </TouchableOpacity>
          { data && data.subCategory && <SubCategory data={data.subCategory.slice()} navigation={navigation} />}
          {(this.props.profile.countryId != 2) && products.productWidget.shopByPv && this.props.profile.activeAddress.addressType && <ShopByPv title={`${strings.shoppingHomeScreen.title.pv} - ${data.name}`} navigation={navigation} extraData={this.extraData} /> }     
          { this.isNewLaunch && this.isNewLaunch.length > 0 && <SidescrollComponent title={`${strings.storeFront.title.newLaunch} - ${data.name}`} navigation={navigation} item={this.isNewLaunch} /> }
          { this.mostViewed && this.mostViewed.length > 0 && <SidescrollComponent title={`${strings.storeFront.title.mostlyViewed} - ${data.name}`} navigation={navigation} item={this.mostViewed} /> }
          { this.topSelling && this.topSelling.length > 0 && <SidescrollComponent title={`${strings.storeFront.title.topSelling} - ${data.name}`} navigation={navigation} item={this.topSelling} /> }
        </ScrollView>
      </View>
    );
  }

  componentWillUnmount(){
    this.props.products.updatePvRange('0-25')
    this.props.products.fetchProductWidget('shopByPv', '0-25');
  }
}

const styles = StyleSheet.create({
  mainView: {
    height: '100%',
  },
  viewAllProducts: {
    ...Specs.fontMedium,
    borderBottomColor: '#515867',
    textDecorationLine: 'underline',
    color: '#515867',
    fontSize: 16,
  }
});