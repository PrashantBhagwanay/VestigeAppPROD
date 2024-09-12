/**
 * @description Order courier tracking modal 
 */
import React, { Component } from 'react';
import {
  View,
  Modal,
  Text,
  Image,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  StyleSheet,
  Dimensions,
  ScrollView
} from 'react-native';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import autobind from 'autobind-decorator';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { CustomButton } from 'app/src/components/buttons/Button';
import Stepper from 'app/src/components/buttons/Stepper';
import Banner from 'app/src/screens/Dashboard/Banner';
import Label from 'app/src/components/customLabel/Label';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import AlertClass from 'app/src/utility/AlertClass';
import Icon from 'react-native-vector-icons/Ionicons';
import { VESTIGE_IMAGE } from 'app/src/utility/constant/Constants';
import Loader from 'app/src/components/loader/Loader';
import { isIphoneXorAbove, showToast, priceWithCurrency, capitalizeFirstCharacter, connectedToInternet } from 'app/src/utility/Utility';

const PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');

@inject('auth', 'cart', 'profile')
@observer
export default class OrderTracking extends Component{
    
static propTypes = {
  modalVisible: PropTypes.bool,
};
    
static defaultProps = {
  modalVisible: false,
};

constructor(props){
  super(props);
  this.props = props;
}


render(){
  const {
    modalVisible,
    handleTrackingModal,
    trackingData,
    courierCompanyName,
    docketNo
  } = this.props;
  return(
    <Modal
      animationType="fade"
      transparent
      visible={modalVisible}
      onRequestClose={() => handleTrackingModal(false)}
    >
      <View style={styles.mainContainer}>
        <View style={[styles.containerInfo, Platform.OS === 'ios' ? styles.containerInfoIos : styles.containerInfoAndroid]}>
          <Loader loading={this.props.cart.isLoading} />
          <View style={styles.headerView}>
            <View style={{flex:0.85, justifyContent: 'center'}}>
              <Text style={styles.headingText}>Tracking Details</Text>
            </View>
            <TouchableOpacity 
              style={{flex:0.15, justifyContent: 'center', alignItems: 'center'}}
              onPress={() => handleTrackingModal(false)}
            >
              <MaterialCommunityIcons 
                name='close-circle' 
                size={40} 
                color='#fff'
              />
            </TouchableOpacity>
          </View>
          <View style={styles.trackingDetails}>
            <ScrollView>
              <View style={{paddingTop:5}}>
                <Text style={styles.delivered}>{`Delivery by: ${courierCompanyName}`}</Text>
                <Text style={styles.tracking}>{`Tracking ID: ${docketNo}`}</Text>
              </View>
              <View style={{ paddingVertical: 10, paddingLeft: 5 }}>
                {trackingData?.map(item => (
                  <View style={{ paddingVertical: 8 }} key={item.SerialNo}>
                    <Text style={styles.statusTitle}>{item.eventTime}</Text>
                    <Text style={styles.statusText}>
                      {item.status} 
                      {` - `}
                      <Text style={[styles.statusText, {...Specs.fontRegular}]}>{item.location}</Text>
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View> 
      </View>
    </Modal>
  )
}
}

const styles = StyleSheet.create({
  mainContainer:{
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000040',
  },
  containerInfo: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height - (isIphoneXorAbove() ? 230 : 165),
    backgroundColor: 'white',
    borderRadius: 10,
    overflow:'hidden'
  },
  containerInfoAndroid: {
    elevation: 15,
  },
  containerInfoIos: {
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#e1e5e6',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  headerView: {
    flex:1, 
    flexDirection:'row', 
    backgroundColor:'#31cab3', 
    justifyContent:'center', 
    paddingLeft: 12
  },
  headingText: {
    ...Specs.fontSemibold,
    fontSize: 25,
    color: '#fff',
    textAlign: 'left'
  },
  delivered: {
    color: '#373e73',
    fontSize: 15,
    ...Specs.fontSemibold
  },
  tracking: {
    color: '#373e73',
    fontSize: 15,
    ...Specs.fontRegular
  },
  trackingDetails : {
    flex:9, 
    backgroundColor:'#fff', 
    paddingHorizontal: 15, 
    paddingVertical:10
  },
  statusTitle:{
    ...Specs.fontBold,
    fontSize: 16,
    color: '#31cab3',
  },
  statusText:{
    ...Specs.fontSemibold,
    fontSize: 14,
    color: '#444444',
  }
});