import React from 'react';
import { Text, View, Modal, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';

const ERROR_IMAGE = require('app/src/assets/images/emptyScreen/Touch_ID.png');

const TouchIdModal = (props) => {
  return (
    <Modal 
      animationType="slide" 
      visible 
      onRequestClose={()=>{  }}>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Image
          style={styles.errorImage} 
          resizeMode="cover"
          source={ERROR_IMAGE}
        />
        <Text style={styles.errorText}>Scan your fingerprint.</Text>
        <TouchableOpacity 
          style={styles.buttonContainer} 
          onPress={() => props.onRetry()}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

}

// export default PaymentFailure;

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 17, 
    width:120,
    height:30,
    backgroundColor: '#14aa93', 
    borderRadius:19,
    alignItems:'center',
    justifyContent:'center',
    borderWidth:1,
    borderColor:'#979797'
  },
  buttonText: {
    ...Specs.fontSemibold,
    color: '#ffffff', 
    fontSize: 14
  },
  errorText: {
    fontSize: 14, 
    ...Specs.fontRegular,
    color:'#3f4967',
    marginHorizontal:20,
    textAlign:'center',
    marginTop:33
  },
  errorImage: {
    height: 80, 
    width: 65,
  }
});

export default TouchIdModal;