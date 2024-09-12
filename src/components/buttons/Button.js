
import React, { Component } from 'react';
import { Text, View, Image, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Icon } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import { Specs } from 'app/src/utility/Theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CART_ICON = require('app/src/assets/images/productList/addToCart.png')

export class Checkbox extends Component {
  constructor(props) {
    super(props);
  }

  updateValue(){
    const {getQuantity, isSelected, index, type,value} = this.props;
    const data = {
      getQuantity:getQuantity,
      isSelected:isSelected,
      index:index,
      type:type,
      value:value
    }
    getQuantity(data);
  }

  render() {
    const {label,isSelected, overrideStyles,checkBoxLabelStyle} = this.props;
    return (    
      <TouchableOpacity 
        style={[styles.mainView, overrideStyles]}  
        onPress={()=> {this.updateValue()}}
      >
        <View style={styles.checkBox}>
          <Icon
            name={isSelected ?'check':''}
            size={17}
            color='green'
          />
        </View>
        <Text style={[styles.checkBoxLabel,checkBoxLabelStyle && checkBoxLabelStyle]} numberOfLines={2}>
          {label} 
        </Text>
      </TouchableOpacity>
    );
         
  }
}

export const CustomButton = (params) => {
  return (
    <TouchableOpacity
      style={[params.buttonContainer, (params.disabled) ? { opacity: 0.4 } : null ]}
      disabled={params.disabled}
      onPress={() => params.handleClick()}
      accessibilityLabel={params.accessibilityLabel}
      testID={params.accessibilityLabel}
    >
      {
        (params.linearGradient) ? (
          <LinearGradient
            colors={[params.primaryColor, params.secondaryColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.button,{ justifyContent: 'center' }, params.buttonGradientStyle]}
          >
            <Text style={params.buttonTitleStyle}>
              {params.buttonTitle}
            </Text>
          </LinearGradient>
        )
          : (
            <Text style={params.buttonTitleStyle}>
              {params.buttonTitle}
            </Text>
          )
      }
    </TouchableOpacity>
  );
};

/**@description 'Catering location based on shipping type' selection button.*/
export const CustomRadioButtonWithIcon = (params) => {
  return (
    <TouchableWithoutFeedback
      style={[params.buttonContainer, { opacity: 0.6 } ]}
      disabled={params.disabled}
      onPress={() => params.handleClick()}
      accessibilityLabel={params.accessibilityLabel}
      testID={params.accessibilityLabel}
    >
      <View>
        <View style={[params.button]}>
          <View style={{flexDirection:'row',justifyContent: 'space-between', paddingHorizontal:2}}>
            <View style={[styles.radioButton, params.radioButtonStyles]}>
              {
                (params.isSelectedValue)?(<View style={[styles.selectedRadioButton, {backgroundColor:'#55D6BE'}]} />):null
              }
            </View>
            <Text style={params.buttonTitleStyle}>{params.buttonTitle}</Text>
            <MaterialCommunityIcons 
              name={params.iconName} 
              size={params.iconSize} 
              color={params.iconColor} 
            />
          </View>
          {(params.buttonInfo) ? (
            <View style={{justifyContent:'center', paddingBottom:2}}>
              <View style={{height: 1, marginHorizontal: 5, backgroundColor: '#E9E9E9', marginVertical:2}} />
              <Text style={params.buttonInfoStyle}>{params.buttonInfo}</Text>
            </View>
          )
            : null
          }
        </View>
        {(params.stripTitle && params.stripText) ? 
          (
            <View style={[params.stripStyle]}>
              <Text style={{...Specs.fontBold, color:'#fff'}}>
                {`${params.stripTitle} : `}
                <Text style={{...Specs.fontBold, color:'#fff'}}>{params.stripText}</Text>
              </Text>
            </View>
          ) : null
        }
      </View>
    </TouchableWithoutFeedback>
  );
};

export const RadioButton = ({
  showButtonText=true, buttonText, onPress, selectedValue,
  radioText, radioButtonStyles, radioContainerStyles, disabled, accessibilityLabel,
}) => {
  const isSelectedValue = selectedValue === buttonText;
  return (
    <TouchableOpacity
      style={[styles.radioButtonContainer, radioContainerStyles]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      testID={accessibilityLabel}
      disabled={disabled}
    >
      <View style={[styles.radioButton, radioButtonStyles]}>
        {isSelectedValue ? <View style={styles.selectedRadioButton} /> : null}
      </View>
      {showButtonText && (
        <Text style={[styles.radioButtonLabel, radioText]}>{buttonText}</Text>
      )}
    </TouchableOpacity>
  );
};

export const CustomRadioButton = ({ buttonText, onPress, isSelected, overrideStyle, accessibilityLabel}) => {
  
  return (
    <TouchableOpacity 
      style={styles.radioButtonContainer}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      testID={accessibilityLabel}
    >
      <View style={styles.radioButton}>
        {
          (isSelected)?(<View style={styles.selectedRadioButton} />):null
        }
      </View>
      <Text style={[styles.radioButtonLabel, overrideStyle]}>
        { buttonText }
      </Text>
    </TouchableOpacity>
  );
};

export const CartButton = ({style, addToCart, disabled=false}) => {
  return(
    <TouchableOpacity 
      style={[styles.cartButton, style]}
      onPress={()=> addToCart()}
      disabled={disabled}
    >
      <Image
        source={CART_ICON}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  mainView:{
    flexDirection:'row',
    height:30, 
    alignItems:'center',
    marginLeft: 30,
    marginRight: 30,
    // marginHorizontal:30
  },
  checkBox:{
    borderWidth:1,
    width:20,
    height:20, 
    alignItems:'center'
  },
  checkBoxLabel: {
    color:'#000000',
    fontSize:14,
    marginLeft:15,
    marginRight:2,
    flexShrink: 1
  },
  button: {
    height: 40,
    width: '90%',
    alignSelf: 'center',
    // borderWidth: 1,
    backgroundColor: '#4DA1CC',
    borderColor: '#4DA1CC',
    borderRadius: 20,
    marginBottom: 10,
  },
  buttonWithIcon : {
    height: 40,
    width: '90%',
    alignSelf: 'center',
    // borderWidth: 1,
    justifyContent:'center',
    backgroundColor: '#4DA1CC',
    borderColor: '#4DA1CC',
    borderRadius: 20,
    marginBottom: 10,
  },
  radioButtonContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    // was creating issue in kyc screen
    // flex: 1,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#58cdb4',
    marginHorizontal: 5,
    marginVertical: 10,
    justifyContent: 'center',
  },
  selectedRadioButton: {
    borderRadius: 20, 
    height: 14, 
    width: 14, 
    backgroundColor: '#58cdb4', 
    alignSelf: 'center',
  },
  selectedRadioButtonWithIcon: {
    borderRadius: 20, 
    height: 14, 
    width: 14, 
    backgroundColor: '#f5f5f5', 
    alignSelf: 'center',
  },
  radioButtonLabel: { 
    ...Specs.fontRegular,
    color: '#545a6b', 
    fontSize: 12,
  },
  cartButton: {
    // width: width, 
    backgroundColor: '#6797d4', 
    flexDirection: 'row', 
    justifyContent: 'center',
    borderRadius: 2
  }
});
