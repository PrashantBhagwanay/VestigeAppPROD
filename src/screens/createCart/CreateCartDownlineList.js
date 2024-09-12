
import React, { Component } from 'react';
import {View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import { inject, observer } from 'mobx-react';
import { observable, computed, makeObservable} from 'mobx';
import { VESTIGE_IMAGE } from 'app/src/utility/constant/Constants';
import autobind from 'autobind-decorator';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import { CustomButton } from 'app/src/components/buttons/Button';
import HeaderSearchIcons from 'app/src/components/navigation/HeaderSearchIcons';
import { Specs } from 'app/src/utility/Theme';
import { Toast } from 'app/src/components/toast/Toast';
import AlertClass from 'app/src/utility/AlertClass';
import Loader  from '../../components/loader/Loader';
import { strings } from '../../utility/localization/Localized';
import { Header } from '../../components';

@inject('cart','auth')
@observer
export default class CreateCartDownlineList extends Component{

  @observable alreadyExistsDistributor: any;

  @computed get selectedDownlineList(){
    return this.props.cart.usersCart.filter(cart => (cart.cartDistributorId !== parseInt(this.props.auth.distributorID)))
  }

  constructor(props){
    super(props);
    makeObservable(this);
  }

  /**
   * @function select downline from the downline list
   */
  @autobind
  async selectedDownline(selectedDownline) {
    const { cart, auth } = this.props;
    let createCart = {};
    if(Object.keys(this.selectedDownlineList).length === 0) {
      createCart = {
        distributorId: selectedDownline.downlineId,
        cartName: `${selectedDownline.firstName} ${selectedDownline.lastName}`,
        createdBy: auth.distributorID,   
        uplineId: auth.distributorID,    
        updatedBy: auth.distributorID,
      }
      const responseMessage = await cart.createCart(createCart);
      (!responseMessage) ? (
        AlertClass.showAlert(strings.createDownlineCartComponent.cartCreatedSuccessfullyTitle, 
          strings.cartListProduct.cartCreated, 
          [
            {text: strings.createDownlineCartComponent.createAnotherCart, onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {text: strings.createDownlineCartComponent.continueShopping, onPress: () =>  this.props.navigation.pop()},
          ])   
      ) : AlertClass.showAlert('', responseMessage, [{text: 'OK', onPress: () => console.log('OK Pressed') }])
      this.props.cart.setSearchedResult();
    }
    else {
      let isValid = this.selectedDownlineList.indexOf(selectedDownline);
      if(isValid < 0){
        createCart={
          distributorId:selectedDownline.downlineId,
          cartName:`${selectedDownline.firstName} ${selectedDownline.lastName}`,
          createdBy:auth.distributorID,   
          uplineId:auth.distributorID,    
          updatedBy:auth.distributorID 
        }
        let responseMessage = await cart.createCart(createCart);
        (!responseMessage)?(
          AlertClass.showAlert(strings.createDownlineCartComponent.cartCreatedSuccessfullyTitle, 
            strings.cartListProduct.cartCreated, 
            [
              {text: strings.createDownlineCartComponent.createAnotherCart, onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
              {text: strings.createDownlineCartComponent.continueShopping, onPress: () =>  this.props.navigation.pop()},
            ])  
        ) : AlertClass.showAlert('', responseMessage, [{text: 'OK', onPress: () => console.log('OK Pressed') }]) 
        this.props.cart.setSearchedResult();
      }
      else {
        this.showToast(strings.cartListProduct.useralreadyAdded, Toast.type.ERROR);
      }
    }
  }

  /**
   * @function remove donwline from the list
   * @param {*} removeDownline downline you want to remove from the list
   */
  @autobind
  removeDownlineCart(removeDownline) {
    let removeDownlineArray = [...this.selectedDownlineList];
    var removeDownlineIndex = removeDownlineArray.indexOf(removeDownline);
    removeDownlineArray.splice(removeDownlineIndex, 1);
    this.selectedDownlineList = removeDownlineArray
    setTimeout( ()=>{ this.showToast(strings.cartListProduct.removeCart, Toast.type.SUCCESS)},200 ) 
  }

  @autobind
  createCartForDownline() {
    this.props.navigation.navigate('createDownlineCart')
  }

  @autobind
  showToast(message: string, toastType:Toast.type) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    })
  }

  renderHeaderSearch = () => {
    return (
      <HeaderSearchIcons
        navigation={this.props.navigation}
        submitButtonText={strings.createDownlineCartComponent.validateButtonText}
        distributorSearchHeader
        back
      />
    )
  }

  render() {
    return(
      <View style={styles.container}>
        <Loader loading={this.props.cart.isLoading} />
        <Header
          navigation={this.props.navigation}
          hideBack
          middleComponent={this.renderHeaderSearch()}
        />
        {
          (this.selectedDownlineList.length>0)? 
            (
              <View style={styles.selectedDownlineListStyle}>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={this.selectedDownlineList}
                  renderItem={({item})=>(
                    <View style={styles.distributorProfileImageContainer} key={item.downlineId}>
                      <Image 
                        source={item.distributorImage ? item.distributorImage : VESTIGE_IMAGE.DISTRIBUTOR_ICON} 
                        style={styles.distributorProfileImageStyle} 
                      />
                      <Text style={styles.distributorTextStyle} numberOfLines={2}>
                        {/* {`${item.firstName} ${item.lastName}`}  */}
                        {item.cartTitle}
                      </Text>
                    </View>
                  )}
                /> 
              </View>
            ) : null
        }

        {(Object.keys(this.props.cart.searchedResult).length < 1 && this.selectedDownlineList.length<1)? <EmptyScreen distributor />: 
          (Object.keys(this.props.cart.searchedResult).length >= 1)?
            ( 
              <View style={styles.cartMainView}>
                <View style={{ flexDirection: 'row'}}>
                  <View style={{ flexDirection: 'row'}}>
                    <Image source={this.props.cart.searchedResult.distributorImage ? this.props.cart.validatedDownline.distributorImage : VESTIGE_IMAGE.DISTRIBUTOR_ICON} style={styles.userIconStyle} />
                  </View>   
                  <View style={[styles.textView]}>
                    <View style={styles.titleView}>
                      <Text style={styles.nameText} ellipsizeMode='tail'>                  
                        {`${this.props.cart.searchedResult.firstName} ${this.props.cart.searchedResult.lastName}`}
                      </Text>
                    </View>
                    <View style={styles.subTitleView}>
                      <View>
                        <Text style={styles.pvText}>
                          {strings.createDownlineCartComponent.idKey+':  '+this.props.cart.searchedResult.downlineId}
                        </Text>
                      </View>
                    </View>
                 
                  </View>
                  <View style={styles.searchedDistributorContainer}>
                    {
                      Object.keys(this.props.cart.alreadyExistsDistributor).length >= 1?  
                        ( 
                          <TouchableOpacity
                            disabled
                            activeOpacity={0.5}
                            style={styles.createCartForDownlineButtonStyle}
                          > 
                            <Text style={[styles.createCartForDownlineButtonTitleStyle, { opacity: 0.7 }]}>{strings.createDownlineCartComponent.alreadyAddedTitle}</Text>
                          </TouchableOpacity>
                        ) : ( 
                          this.selectedDownlineList.length < 3 && (
                            <CustomButton
                              handleClick={() => this.selectedDownline(this.props.cart.searchedResult)}
                              buttonTitleStyle={styles.createCartForDownlineButtonTitleStyle}
                              buttonContainer={styles.createCartForDownlineButtonStyle}
                              buttonTitle={strings.createDownlineCartComponent.createCartButtonTitle}
                            />
                          )
                        )
                    }
                  </View>
                </View>
              </View>
            ) : null
        }
        {/* {
          (this.selectedDownlineList.length > 0)?
            (
              <TouchableOpacity
                style={styles.navigationButtonStyle}
                onPress={() => this.createCartForDownline()}
              >
                <Image source={VESTIGE_IMAGE.FORWARD_ICON} />
              </TouchableOpacity>
            ) 
            : null
        } */}
      </View>
    )
  }
}

/**
 * @description CreateCartDownlineList Screen CSS defined here
 */
const styles=StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f5f8',
  },
  distributorProfileImageContainer: {
    alignItems: 'center',
    marginLeft: 17,
    marginTop: 20,
    marginBottom: 10,
    width: 50,
  },
  distributorProfileImageStyle: {
    height: 45,
    width: 45,
    borderRadius: 20,
  },
  selectedDownlineListStyle: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 10,
    height: 110,
  },
  userIconStyle: {
    height: 32,
    width: 32,
    marginTop: 12,
    marginBottom: 12,
    marginLeft: 16,
    marginRight: 11,
    borderRadius: 20
  },
  createCartForDownlineButtonStyle: {
    justifyContent: 'center',
    borderWidth: 1,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    height: 25,
    // width: 100,
    borderColor: '#6797d4',
    marginBottom: 10,
    marginTop: 45,
    borderRadius: 50,
    marginRight: 10,
  },
  createCartForDownlineButtonTitleStyle: {
    ...Specs.fontSemibold,
    alignSelf: 'center',
    color: '#6797d4',
    fontSize: 14,
    paddingHorizontal: 10
  },
  cartMainView: {
    flexDirection: 'column', 
    backgroundColor: '#FFFFFF', 
    marginHorizontal: 15, 
    marginTop: 10, 
    elevation: 10
  },
  textView: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    marginTop: 11, 
    backgroundColor:'#fff',
  },
  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameText: {
    ...Specs.fontRegular,
    fontSize: 12,
    color: '#515867',
  },
  pvText: {
    color: '#404652',
    fontWeight: 'bold',
    ...Specs.fontRegular,
  },
  subTitleView: {
    marginTop: 5, 
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navigationButtonStyle: {
    position: 'absolute',
    bottom: 20,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  distributorTextStyle: {
    fontSize: 12, 
    color: '#515867', 
    flex: 1,
    ...Specs.fontRegular,
  },
  searchedDistributorContainer: {
    flexDirection: 'row', 
    justifyContent: 'center' ,
    alignItems: 'center',
  }
})