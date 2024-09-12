import { computed, observable, makeObservable } from 'mobx';
import React, { Component } from 'react';
import {
  View, 
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Image,
  Text
} from 'react-native';
import Loader  from 'app/src/components/loader/Loader';
import { inject, observer } from 'mobx-react';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import CustomTopTab from 'app/src/components/topTab/CustomTopTab';
import { Specs } from 'app/src/utility/Theme';
import { OrderViewEnum } from 'app/src/utility/constant/Constants';
import { strings } from 'app/src/utility/localization/Localized';
import OfflineNotice from 'app/src/components/OfflineNotice';
import autobind from 'autobind-decorator';
import moment from 'moment';
import { connectedToInternet } from 'app/src/utility/Utility';
import OrderDetails from 'app/src/screens/orders/OrderDetails';
import OrderStatus from 'app/src/screens/orders/OrderStatus';
import { Toast } from 'app/src/components/toast/Toast';
import { Header } from '../../components';


const orderViewTabTitle = [
  { title: OrderViewEnum.orderStatus },
  { title: OrderViewEnum.orderDetails },
];

@inject('cart','profile','auth')
@observer
class OrderView extends Component {
  @observable isInternetConnected: Boolean = true;
  @observable orderObject;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.orderObject = this.props.route.params?.item;
    const defaultSelectedTab = this.props.route.params?.defaultSelectedTab;
    this.state = {
      isImagePickerVisible: false,
      selectedTab: defaultSelectedTab ? defaultSelectedTab : orderViewTabTitle[0].title,
      isLoading: false,
      isProductDetailFetched: false,
    };
  }

  async componentDidMount(){
    this.isInternetConnected = await connectedToInternet();
    await this.handleOrderStatus();
    await this.handleOrderDetails();
  }

  handleOrderStatus = async () => {
    this.setState({ isLoading: true });
    const isApiV2 = this.orderObject?.orderCreatedBy === 'Web_V2';
    const fetchOrderStatus = await this.props.cart.orderStatusTracking(this.orderObject?.customerOrderNo, isApiV2);
    this.setState({ isLoading: false });
    // if(!fetchOrderStatus.success){

    // }
  }


  handleOrderDetails = async () => {
    this.setState({ isLoading: true })
    const isApiV2 = this.orderObject?.orderCreatedBy === 'Web_V2';
    const checkIsProductDetailFetched = await this.props.cart.getOrderDetails(this.orderObject.customerOrderNo, this.orderObject.invoiceNo, this.orderObject.logNo, isApiV2);
    this.setState({ 
      isProductDetailFetched: checkIsProductDetailFetched,
      isLoading: false 
    })
    if (!this.state.isProductDetailFetched) {
      this.showToast(strings.commonMessages.noProductRelated, Toast.type.ERROR)
    }
  }

  handleImagePickerVisibility = value => {
    this.setState({ isImagePickerVisible: value });
  };

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
      await this.handleOrderDetails();
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

  handleTabCallback = (type) => {
    const { selectedTab } = this.state;
    if(type !== selectedTab){
      this.setState({
        selectedTab: type,
      })      
    }
  }

  orderNumberView = () => {
    return (
      <View style={styles.orderView}>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderText}>
            {`Order No: ${this.orderObject.customerOrderNo}`}
          </Text>
          <Text style={[styles.orderOn, { marginLeft: 0 }]}>
            {`Order on ${moment(this.orderObject.createdDate).format('DD MMM YYYY, hh:mm A')}`}
          </Text>
        </View>
      </View>
    );
  }

  render() {
    const { selectedTab } = this.state;
    return (
      <View style={styles.mainView}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Loader loading={this.props.cart.isLoading || this.state.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.order.orderView.screenTitle}
        />
        {this.orderNumberView()}
        <CustomTopTab
          selectedValue={selectedTab}
          handleTabCallback={this.handleTabCallback}
          data={orderViewTabTitle}
          style={{ marginBottom: 2, height: 50 }}
          textStyle={styles.tabTextStyle}
        />
        {selectedTab === OrderViewEnum.orderStatus ? (
          <OrderStatus />
        ) : (
          <OrderDetails
            {...this.props}
            item={this.orderObject}
            isProductDetailFetched={this.state.isProductDetailFetched}
            isImagePickerVisible={this.state.isImagePickerVisible}
            handleImagePickerVisibility={this.handleImagePickerVisibility}
          />
        )}
      </View>
    );
  }
}

export default OrderView;

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  tabTextStyle: {
    textAlign: 'center',
    paddingVertical: 15,
    fontSize: 14,
    ...Specs.fontMedium,
  },
  orderView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    paddingLeft: 18,
    paddingRight: 16,
    backgroundColor: '#F7F7F7',
  },
  orderText: {
    fontSize: 15,
    lineHeight: 18,
    color: '#373e73',
    ...Specs.fontMedium,
  },
  orderOn: {
    color: '#31cab3',
    ...Specs.fontSemiBold,
    fontSize: 11,
  },
});
