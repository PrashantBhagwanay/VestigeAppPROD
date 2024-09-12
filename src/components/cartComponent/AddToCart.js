/**
 * @description AddToCart scrren 
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
  ScrollView,
} from 'react-native';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { CustomButton } from 'app/src/components/buttons/Button';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import AlertClass from 'app/src/utility/AlertClass';
import Icon from 'react-native-vector-icons/Ionicons';
import { VESTIGE_IMAGE } from '../../utility/constant/Constants';
import Loader from '../loader/Loader';

@inject('auth', 'cart')
@observer
export default class AddToCart extends Component<any, any>{
    
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
      openBuyingPreferenceVisible,
      confirmBuyerCart,
      setConfirmBuyer,
      createCartForDownline,
      selectedCheckBox,
      startShopping,
      auth
    } = this.props;
    const { selectingCarts } = this.props.cart;
    return(
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          openBuyingPreferenceVisible(!modalVisible)
        }}
      >
        <Loader loading={this.props.cart.isLoading} />
        <TouchableOpacity activeOpacity={1} style={styles.pickerContainer}>
          <View style={styles.modalContainer}>
            <View style={styles.modalTopContainer}>
              <Text style={styles.buyingPreferenceTextStyle}>{strings.addToCart.buyingPreference}</Text>
              <TouchableOpacity
                style={styles.openBuyingPreferenceContainer}
                onPress={() => { openBuyingPreferenceVisible(!modalVisible) }}
              >
                <Image style={styles.closeIconStyle} tintColor='#252c36' source={VESTIGE_IMAGE.CLOSE_ICON} />
              </TouchableOpacity>
            </View>
            <View style={styles.buyingForSelfContainer}>
              {(selectedCheckBox.indexOf('Your Cart') >= 0) ? <Image source={VESTIGE_IMAGE.CONFIRM_ICON} /> : null}
              <Text onPress={()=>(selectedCheckBox.indexOf('Your Cart') < 0) ? confirmBuyerCart('Your Cart'): setConfirmBuyer('Your Cart')} style={[styles.textStyle, {paddingVertical: 16}]}>
                {strings.addToCart.buyingOption1}
              </Text>
            </View>
            {(selectingCarts.length > 0) ? (
              <View>
                <View style={{flexDirection:'row', alignItems:'center', marginBottom: 8}}>
                  <Text style={styles.buyingForDownlineTextStyle}>{strings.addToCart.buyingOption2}</Text>
                  <TouchableWithoutFeedback
                    style={styles.openBuyingPreferenceContainer}
                    onPress={() => {
                      selectingCarts.length < 3 ? (
                        this.props.cart.setSearchedResult(),
                        createCartForDownline()
                      ) : (
                        AlertClass.showAlert('', 
                          strings.cartListProduct.createCartForDownline, 
                          [
                            {text: 'Ok', onPress: () => console.log('Ok')}
                          ])   
                      )
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center',}}>
                      <Icon name={Platform.OS === 'ios' ? 'ios-add-circle' : 'md-add-circle'} color="#373e73" size={20} />
                      <Text style={styles.addMoreTextStyle}>{strings.addToCart.addMoreText}</Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
                <ScrollView style={selectingCarts.length > 3 ? { height: 130 }: null} keyboardShouldPersistTaps='always'> 
                  {
                    selectingCarts.map((downline)=>{
                      return(
                        (downline.cartDistributorId !== parseInt(auth.distributorID))? (
                          <View style={styles.dowlineListContainer} key={downline.cartId}>
                            {
                              (selectedCheckBox.indexOf(downline.cartTitle)>= 0)?<Image source={VESTIGE_IMAGE.CONFIRM_ICON} /> : null
                            }
                            <Text  
                              style={[styles.textStyle, {paddingVertical: 10}]}
                              onPress={()=>
                                (selectedCheckBox.indexOf(downline.cartTitle)<0) ? confirmBuyerCart(downline.cartTitle) : setConfirmBuyer(downline.cartTitle)
                              }
                            >
                              {downline.cartTitle+'\'s Cart'}
                            </Text>
                            <TouchableOpacity
                              onPress={()=> Alert.alert(
                                strings.addToCart.removeCartHeading,
                                strings.addToCart.removeCart +  strings.addToCart.removeCart2 ,
                                [
                                  {text: strings.commonMessages.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                                  {text: strings.commonMessages.ok, onPress: async() => {
                                    await this.props.cart.removeCart(downline.cartId)
                                    setConfirmBuyer(downline.cartTitle)
                                  }},
                                ],
                                { cancelable: false }
                              )}
                            >
                              <Icon
                                style={{padding: 10,}}
                                name={Platform.OS === 'ios' ? 'ios-remove-circle-outline' : 'md-remove-circle-outline'}
                                color="#373e73"
                                size={20}
                              />
                            </TouchableOpacity>
                          </View>
                        ): null
                      )
                    })
                  }
                </ScrollView>
                <CustomButton
                  handleClick={() => startShopping()}
                  linearGradient
                  buttonContainer={[styles.button, { marginTop: '3%'}]}
                  buttonTitle={strings.addToCart.ContinueShopping}
                  buttonTitleStyle={styles.customButtonTitleStyle}
                  primaryColor="#6895d4"
                  secondaryColor="#57a5cf"
                />
              </View>
            ):(
              <View>
                <CustomButton
                  handleClick={() => createCartForDownline()}
                  buttonTitleStyle={styles.createCartForDownlineButtonTitleStyle}
                  buttonContainer={styles.createCartForDownlineButtonStyle}
                  buttonTitle={strings.addToCart.addToCartButtonTitle}
                />
                <CustomButton
                  handleClick={() => startShopping()}
                  linearGradient
                  buttonContainer={styles.button}
                  buttonTitle={strings.addToCart.ContinueShopping}
                  buttonTitleStyle={styles.customButtonTitleStyle}
                  primaryColor="#6895d4"
                  secondaryColor="#57a5cf"
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    )
  }
}

const styles=StyleSheet.create({
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
  },
  modalTopContainer: {
    marginTop: 20, 
    marginHorizontal: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    flexDirection: 'row',
  },
  buyingPreferenceTextStyle: {
    fontSize: 14, 
    color: '#373e73', 
    flex: 1, 
    alignSelf:'flex-end',
    ...Specs.fontSemibold
  }, 
  openBuyingPreferenceContainer: {
    borderRadius: 20, 
    backgroundColor: '#F1F5F7', 
    width: 22, 
    height: 22, 
    justifyContent: 'center'
  },
  closeIconStyle: {
    height: 14,
    width: 14, 
    alignSelf: 'center'
  },
  buyingForSelfContainer: {
    marginHorizontal: 15, 
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row', 
  },
  buyingForDownlineTextStyle: {
    ...Specs.fontSemibold,
    marginLeft: 15, 
    flex: 1,
    fontSize: 14, 
    color: '#373e73'
  },
  createCartForDownlineButtonStyle: {
    justifyContent: 'center',
    borderWidth: 1,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    height: 35,
    width: '92%',
    borderColor: '#6797d4',
    marginBottom: 15,
  },
  createCartForDownlineButtonTitleStyle: {
    ...Specs.fontSemibold,
    alignSelf: 'center',
    color: '#6797d4',
    fontSize: 14,
  },
  button: {
    // marginTop: '5%',
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 20,
  },
  customButtonTitleStyle: {
    fontSize: 16,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center'
  },
  dowlineListContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    marginHorizontal: 15, 
  },
  textStyle: {
    flex: 1,
    ...Specs.fontRegular,
    fontSize: 14, 
    color: '#3f4967', 
    marginLeft: 8,
  },
  addMoreTextStyle: {
    ...Specs.fontRegular,
    marginLeft: 5.8, 
    marginRight: 15 ,
    color: '#3f4967', 
    fontSize: 12
  },
  pickerContainer: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
})