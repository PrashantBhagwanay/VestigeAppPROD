import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  BackHandler
} from 'react-native';
import { VESTIGE_IMAGE } from 'app/src/utility/constant/Constants';
import Loader  from 'app/src/components/loader/Loader';
import { inject } from 'mobx-react';
import { Specs } from 'app/src/utility/Theme';
import { Toast } from 'app/src/components/toast/Toast';
import { gotoHome,gotoHomeOrderConfirm, goToOrderDetails } from 'app/src/utility/Utility';
import { strings } from 'app/src/utility/localization/Localized';
import { Header } from '../../components';

@inject('profile', 'checkout', 'cart')
export default class OrderConfirmation extends Component {

  
  // @autobind
  toast = (message, type) => {
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: Toast.type[type],
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  constructor(props) {
    super(props);
    this.props= props;
    this.state = {
      isLoading: false
    }
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }
  handleBackButton() {
    return true;
  }

  render(){
    const { username, activeAddress, defaultCater } = this.props.profile;
    return(
      <View style={{ flex: 1 }}>
        <Header
          navigation={this.props.navigation}
          hideBack
          screenTitle={strings.order.confirmation}
          headerTextStyle={styles.textTitleStyle}
        />
        <ScrollView style={{flex:1}}>
          <View style={styles.confirmContainer}>
            <Loader loading={this.state.isLoading} />  
            <View style={{flexDirection:'row'}}>
              <Image source={VESTIGE_IMAGE.CONFIRM_ICON} style={{marginTop:4}} />
              <Text style={styles.confirmText}>{strings.order.orderConfirmed}</Text>  
            </View>
            <Text style={styles.shoppingText}>
              <Text style={{...Specs.fontBold}}>
                {strings.order.thanks} 
              </Text>
              {strings.order.notShipped}
            </Text>
            {/* <TouchableOpacity 
              style={styles.cartButton}
              // onPress={()=> this.props.navigation.navigate('orders', {navigateTo : 'Dashboard'})} 
              onPress={ async()=> {
                this.setState({ isLoading: true })
                await this.props.cart.fetchOrdersList();
                this.setState({ isLoading: false })
                gotoHomeOrderConfirm(this.props.navigation, 'orders')
              }}
            > 
              <Text style={styles.cartButtonText}>{strings.order.cartDetails}</Text>
            </TouchableOpacity> */}
          </View>
          <View style={styles.confirmContainer}>
            <Text style={styles.detailsTitle}>{strings.order.shippingAddress}</Text>  
            <Text style={{...Specs.fontBold}}>{username}</Text>
            <Text>{activeAddress  && (defaultCater.locationName || activeAddress.address)}</Text>
          </View>
          <TouchableOpacity
            style={styles.homepageButton}
            onPress={()=> {
              if(this.props.route.params?.isCartCheckout ){
                gotoHomeOrderConfirm(this.props.navigation, 'Shopping')
              } 
              else {
                gotoHomeOrderConfirm(this.props.navigation, 'Shopping', true)
              }
            }}
          >
            <Text style={styles.homepageButtonTitle}>{strings.order.backToHome}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }
}

const styles=StyleSheet.create({
  textTitleStyle: {
    color: '#373e73',
    fontSize: 18,
    ...Specs.fontBold
  },
  confirmContainer: {
    backgroundColor:'#fff',
    marginVertical:9,
    paddingTop:14,
    paddingHorizontal:15,
    paddingBottom:23,
  },
  confirmText: {
    color:'#31cab3',
    ...Specs.fontMedium,
    marginLeft:14
  },
  shoppingText:{
    marginTop:14,
    color:'#3f4967',
    marginBottom:23
  },
  cartButton: {
    borderWidth:1,
    borderColor:'#6797d4',
    borderRadius:2,
    alignItems:'center'
  },
  cartButtonText: {
    ...Specs.fontBold,
    color:'#6797d4',
    paddingVertical:8
  },
  detailsTitle: {
    color:'#373e73',
    ...Specs.fontSemibold,
    marginBottom:21
  },
  homepageButton: {
    backgroundColor:'#6797d4',
    borderRadius:50,
    alignItems:'center',
    marginHorizontal:16,
    paddingVertical:12,
    marginTop:53,
    
  },
  homepageButtonTitle: {
    color:'#fff',
    fontSize:16,
    ...Specs.fontMedium
  }
})    