/**
 * @description CreateDownlineCart Screen
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import AlertClass from 'app/src/utility/AlertClass';

// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { strings } from 'app/src/utility/localization/Localized';

import { CustomButton } from '../../components/buttons/Button';
import { VESTIGE_IMAGE } from '../../utility/constant/Constants';
import { Header } from '../../components';

@inject('cart','auth')
@observer
export default class CreateDownlineCart extends Component {
    
  constructor(props){
    super(props);
    this.state={
      renameCart: false,
      newCartName: '',
    }
  }

    /**
     * @function startShopping navigate
     */
    startShopping = () => {
      this.props.navigation.pop(2);
    }

    renameCart = async(cartInfo) => {
      this.setState({
        renameCart: true,
      })
      const { cart } = this.props;
      const { newCartName } = this.state;
      const renameCartInfo = {
        cartName: await newCartName,
        cartId:cartInfo.cartId,
        updatedBy:11000077
      }
    }

    removeCart = async(cartInfo) => {
      AlertClass.showAlert(
        strings.addToCart.removeCartHeading, 
        strings.addToCart.removeCart, 
        [
          {text: strings.commonMessages.ok, onPress: async () => {
            const { cart } = this.props;
            await cart.removeCart(cartInfo)
            this.props.cart.setSearchedResult(); 
            // this.initializeDownlineCartInfo();
          }},
          {text: strings.commonMessages.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        ]
      ) 
    }

    renameCartTitle = async(event) => {
      this.setState({
        newCartName: event.nativeEvent.text,
      })
    }

    render(){
      const { renameCart } = this.state;
      const { navigation, auth } = this.props;
      return (
        <View style={styles.container}>
          <Header
            navigation={this.props.navigation}
            screenTitle={strings.createDownlineCartComponent.createCartForDownline}
          />
          <ScrollView keyboardShouldPersistTaps='always'>
            {
              this.props.cart.cartInfo.map((downlineCartListData) => {
                return (
                  (downlineCartListData.cartDistributorId !== parseInt(auth.distributorID))?
                    (
                      <View key={downlineCartListData.distributorId}>
                        <View style={styles.donwlineCartListContainer}>
                          <View style={styles.downlineCartListDataContainer}>
                            <Image style={styles.downlineCartListIconContainer} source={VESTIGE_IMAGE.CART_ICON} />
                            <View style={styles.downlineCartListUserCartContainer}>
                              <TextInput 
                                style={styles.downlineCartListUserCartTitleStyle}
                                defaultValue={downlineCartListData.cartTitle}
                                underlineColorAndroid="transparent"
                                autoCapitalize='none'
                                autoCorrect={false}
                                editable={renameCart}
                                onEndEditing={(value)=>
                                  this.renameCartTitle(value)}
                              />
                            </View>
                            <TouchableOpacity
                              style={styles.downlineCartListUserCartCloseContainer}
                              onPress={()=> this.removeCart(downlineCartListData.cartId)}
                            >
                              <Image style={styles.downlineCartListUserCartCloseIconStyle} tintColor="#C0C5C8" source={VESTIGE_IMAGE.CLOSE_ICON} />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.downlineCartListHorizontalLineStyle} />
                        <View 
                          style={styles.downlineCartListUserContainer}
                        > 
                          <Image source={(downlineCartListData.distributorImage)?downlineCartListData.distributorImage :VESTIGE_IMAGE.DISTRIBUTOR_ICON} style={styles.downlineCartListUserIconStyle} />
                          <Text style={styles.downlineCartListUserTitleStyle}>
                            {downlineCartListData.cartTitle+'\'s Cart'}
                          </Text>
                          <Text style={styles.downlineCartListUserIdStyle}>
                            {strings.createDownlineCartComponent.idKey+': '+ downlineCartListData.cartDistributorId}
                          </Text>
                        </View>
                      </View>
                    ) : null)
              })
            }
        
            <View style={styles.createAnotherCartContainer}>
              <Image style={styles.createAnotherCartIconStyle} source={VESTIGE_IMAGE.ADD_ICON} />
              <Text 
                style={styles.createAnotherTitleStyle}
                onPress={() => navigation.goBack()}
              >
                {strings.createDownlineCartComponent.createAnotherCartMessage}
              </Text>
            </View>

            <CustomButton
              {...this.props}
              handleClick={() => this.startShopping()}
              linearGradient
              buttonContainer={styles.button}
              buttonTitle={strings.createDownlineCartComponent.shopNowButtonText}
              buttonTitleStyle={styles.customButtonTitleStyle}
              primaryColor="#6895d4"
              secondaryColor="#57a5cf"
            />
          </ScrollView>
        </View>
      )
    }
}

/**
 * @description CeateDownlineCart CSS design defined here
 */
const styles=StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF3F7',
  },

  button: {
    marginTop: '5%',
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
  donwlineCartListContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    marginTop: 8,
  },
  downlineCartListDataContainer: {
    flex:1, flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    marginLeft: 16,
  },
  downlineCartListIconContainer: {
    height: 16,
    width: 17,
    marginRight: 10,
  },
  downlineCartListUserCartContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  downlineCartListUserCartTitleStyle: {
    fontSize: 16,
    color: '#3f4967', 
    marginRight: 10,
  },
  downlineCartListUserCartCloseContainer: {
    backgroundColor: '#F1F5F7',
    marginRight: 7,
    height: 26,
    width: 26,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  downlineCartListUserCartCloseIconStyle: {
    alignSelf: 'center',
    height: 11,
    width: 10,
  },
  downlineCartListHorizontalLineStyle: {
    borderBottomWidth: 2,
    borderBottomColor: '#ebecee',
  },
  downlineCartListUserContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downlineCartListUserIconStyle: {
    height: 32,
    width: 32,
    marginTop: 12,
    marginBottom: 12,
    marginLeft: 8,
    borderRadius: 20,
  },
  downlineCartListUserTitleStyle: {
    color: '#515867',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  downlineCartListUserIdStyle: {
    color: '#515867',
    fontSize: 14,
    marginRight: 12,
  },
  createAnotherCartContainer: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  createAnotherCartIconStyle: {
    height: 10,
    width: 10,
    marginRight: 10,
    opacity: 0.6
  },
  createAnotherTitleStyle: {
    fontSize: 16,
    color: '#414456',
    opacity: 0.6
  },
});