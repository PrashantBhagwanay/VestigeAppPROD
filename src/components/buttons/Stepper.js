// @flow

import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { connectedToInternet, showToast } from 'app/src/utility/Utility';
import autobind from 'autobind-decorator';
import { Toast } from 'app/src/components/toast/Toast';
import { strings } from '../../utility/localization/Localized';
import { _ } from 'lodash';

type PropsType = {
  children: any,
  style: any,
  isDelete: boolean,
  getQuantity: ?Function,
  onDeletePress: ?Function,
  addOrRemoveProduct: ?Function,
  isDisabled: boolean
}

type StateType = {
  quantity: number;
};

export default class Stepper extends Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props);
    this.state = {
      quantity: props.children ? parseInt(props.children) : 1
    }
  }
  
  @autobind
  async onPress(action: string) {
    const isConnectedToInternet = await connectedToInternet();
    if(isConnectedToInternet) {
      const {isDelete, getQuantity, onDeletePress, isDisabled, addOrRemoveProduct, availableQuantity, maxLimitReached} = this.props;
      if(isDisabled){
        return
      }
      if(action === 'add') {
        await this.setState(previousState => {
          if(previousState.quantity === availableQuantity) {
            maxLimitReached(strings.product.maxLimit,Toast.type.SUCCESS)
          }
          else {
            addOrRemoveProduct && addOrRemoveProduct(1)
            return {quantity: previousState.quantity + 1};
          }
        })
      }
      else {
        await this.setState(previousState => { 
          if(previousState.quantity > 1) {
            addOrRemoveProduct && addOrRemoveProduct(-1)
            return {quantity: previousState.quantity - 1};
          } 
          else {
            {isDelete && onDeletePress && onDeletePress()}
            return previousState;
          }
        })
      }
      
      getQuantity && getQuantity(this.state.quantity);
    }
    else {
      showToast(strings.commonMessages.noInternet)
    }
  }

  render() {
    const { style, isDelete, isDisabled } = this.props;
    const {quantity} = this.state;
    let containerStyle=[styles.container, style]
    if(isDisabled){
      containerStyle =[styles.container, style, styles.disableStriper]
    }
    return(
      <View pointerEvents='auto' style={containerStyle}>
        <TouchableOpacity accessibilityLabel="Add_Quantity" testID="Add_Quantity" style={styles.button} onPress={() => { this.onPress('subtract')}}>
          <FontAwesome name={quantity <= 1 && isDelete ? 'trash-o' : 'minus'} size={13} color='#6797d4' />    
        </TouchableOpacity>
        <Text style={styles.text}>{quantity}</Text>
        <TouchableOpacity accessibilityLabel="Subtract_Quantity" testID="Subtract_Quantity" style={styles.button} onPress={() => { this.onPress('add')}}>
          <FontAwesome name='plus' size={13} color='#6797d4' />    
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#6797d4',
    overflow:'hidden',
  },
  disableStriper:{
    opacity:0.5
  },
  button: {
    padding: 8,
  },
  text: {
    ...Specs.fontSemibold, 
    fontSize: 10, 
    textAlign: 'center', 
    color: '#000', 
    lineHeight: 14,
    paddingHorizontal: 4,
  }
});