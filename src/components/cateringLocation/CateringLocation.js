import React, { Component } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Linking, 
  Platform 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { strings } from 'app/src/utility/localization/Localized';
import { inject, observer } from 'mobx-react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {capitalizeFirstCharacter } from 'app/src/utility/Utility';
import { Specs } from 'app/src/utility/Theme';
import { SHIPPING_TYPE, SHIPPING_TYPE_ID } from "app/src/utility/constant/Constants";

const colorScheme = {
  regular: '#578BD3',
  express: '#2CA58D',
  warehouse: '#F1A66A'
}

const backgroundColorScheme = {
  regular: '#578BD325',
  express: '#2CA58D25',
  warehouse: '#F1A66A25'
}

@inject('profile')
@observer
export default class CateringLocation extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  fetchCateringColorScheme = () => {
    const {defaultShippingType} = this.props.profile;
    if(defaultShippingType == SHIPPING_TYPE.warehouseDelivery ){
      return colorScheme.warehouse
    }
    else if(defaultShippingType == SHIPPING_TYPE.expressDelivery){
      return colorScheme.express
    }
    else{
      return colorScheme.regular
    }
  }

  fetchInfoBackgroundColor = () => {
    const {defaultShippingType} = this.props.profile;
    if(defaultShippingType == SHIPPING_TYPE.warehouseDelivery ){
      return backgroundColorScheme.warehouse
    }
    else if(defaultShippingType == SHIPPING_TYPE.expressDelivery){
      return backgroundColorScheme.express
    }
    else{
      return backgroundColorScheme.regular
    }
  }

  fetchDeliveryType = () => {
    const {defaultShippingType} = this.props.profile;
    return defaultShippingType;
  }

  fetchBranchName = (cateringBranch) => {
    const formatedBranchName = `${cateringBranch.locationName} - ${cateringBranch.locationCode}`
    return formatedBranchName;
  }

  isTouchDisabled = () => {
    const {isExpressAvailable, isWarehouseAvailable} = this.props.profile;
    if(isExpressAvailable || isWarehouseAvailable){
      return false;
    }
    else{
      return true
    }
  }

  renderCateringBranch = () => {
    return (
      <View style={[styles.rowContainer, {justifyContent:'flex-start'}]}>
        <Text style={[styles.addressText, {...Specs.fontBold, fontSize:14, marginRight: 5}]}> 
          {`${strings.selectShippingType.cateringStripTitle} : `}
          <Text numberOfLines={2} style={[styles.addressText]}>{this.fetchBranchName(this.props.profile.defaultCater)}</Text>
        </Text>
      </View>
    )
  }

  renderPickupStore = () => {
    const {fetchIsWarehouseShipping, fetchWarehouseDeliveryType, fetchRegularCatering} = this.props.profile;
    if(fetchIsWarehouseShipping == '1' && fetchWarehouseDeliveryType == '2'){
      return(
        <View style={[styles.rowContainer, {justifyContent:'flex-start'}]}>
          <Text style={[styles.addressText, {...Specs.fontBold, fontSize:14, marginRight: 5}]}> 
            {`${strings.selectShippingType.pickupStore} : `}
            <Text numberOfLines={2} style={[styles.addressText]}>{this.fetchBranchName(fetchRegularCatering)}</Text>
          </Text>
        </View>
      )
    }
  }

  renderDeliveryInfo = () => {
    const {fetchIsWarehouseShipping, fetchWarehouseDeliveryType, fetchRegularCatering} = this.props.profile;
    let message = '';
    if(fetchIsWarehouseShipping == '1' && fetchWarehouseDeliveryType == '2'){
      message = `${strings.selectShippingType.warehouseToStoreMessage} : ${fetchRegularCatering.locationName} - ${fetchRegularCatering.locationCode}`
    }
    else{
      message = strings.selectShippingType.homeDeliveryMessage
    }
    return(
      <View style={[styles.messageContainer, {backgroundColor: this.fetchInfoBackgroundColor()}]}>
        <Text style={[styles.addressText, {...Specs.fontSemiBold, textAlign: 'center', color:this.fetchCateringColorScheme()}]}> 
          {message}
        </Text>
      </View>
    )
  }

  render(){
    const {profile,navigation,containerStyle, disabled, navigationParams}=this.props
    const {defaultActiveAddressType}= profile;
    if(defaultActiveAddressType === 'Home-Delivery'){ 
      return (
        <TouchableOpacity 
          onPress={()=>navigation.navigate('selectShippingType', navigationParams)} 
          activeOpacity={0.9} 
          disabled={disabled ? disabled : this.isTouchDisabled()}
          style={[styles.mainContainer, containerStyle]}
        >
          <View style={[styles.rowContainer, {height:20}]}>
            <Text style={[styles.addressText, {...Specs.fontBold, color: this.fetchCateringColorScheme(), fontSize:16}]}>
              {this.fetchDeliveryType()}
            </Text>
            {(!this.isTouchDisabled() && !disabled) && 
            (
              <FontAwesome
                name='pencil'
                size={17}
                color={this.fetchCateringColorScheme()}
              />
            )}
          </View>
          {this.renderCateringBranch()}
          {this.renderPickupStore()}
          {this.renderDeliveryInfo()}
        </TouchableOpacity>
      )
    }
    return null
  }
}

const styles=StyleSheet.create({
  mainContainer:{
    //width:Dimensions.get('window').width-20, 
    marginVertical:10, 
    marginHorizontal:10, 
    paddingHorizontal:10,
    paddingVertical:5,
    borderRadius:10, 
    borderWidth:0.5,
    borderColor:'#001A2350',
    elevation:4, 
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#808080',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    backgroundColor:'#fff'
  },
  rowContainer:{
    flexDirection:'row', 
    alignItems: 'center', 
    justifyContent:'space-between', 
  },
  addressText:{
    ...Specs.fontRegular,
    fontSize: 13,
    color: '#373e73',
    // marginTop:1,
  },
  messageContainer:{
    flexDirection:'row', 
    alignItems: 'center', 
    justifyContent:'center', 
    marginVertical: 5,
    paddingVertical: 5,
    borderRadius: 10
  }
})