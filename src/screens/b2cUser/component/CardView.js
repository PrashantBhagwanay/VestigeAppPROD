import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityBase,
} from 'react-native';
import { B2CUserListTypeEnum } from '../../../utility/constant/Constants';
import { Specs } from '../../../utility/Theme';

const CardView = ({type,itemData,onSendRequest,onApproveClick,levelId}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.text}>
          <Text style={styles.subHeadingText}>· Distributor Id:{` `}</Text>
          {itemData?.distributorId}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.subHeadingText}>· Name:{` `}</Text>
         {itemData?.distributorName}
        </Text>

        {type ===B2CUserListTypeEnum.B2CJoinee &&<Text style={styles.text}>
          <Text style={styles.subHeadingText}>· Mobile:{` `}</Text>
        {itemData?.mobileNo}
        </Text>}
      </View>

      {type ===B2CUserListTypeEnum.B2CRequest &&  itemData?.isAccepted==' ' &&
        <Text style={[styles.text,{fontSize:10,alignSelf:'center'}]}>
         you can view your number of {itemData?.distributorName.toLowerCase()}
      </Text>
      
      }

{type ===B2CUserListTypeEnum.B2CRequest &&  itemData?.isAccepted!=' ' &&
        <Text style={[styles.text,{fontSize:10,alignSelf:'center',color:'green'}]}>
         you have approved this request
      </Text>
      
      }
      

      {type ===B2CUserListTypeEnum.B2CJoinee  && levelId!=1 ? itemData?.isRaised ==' ' &&  <TouchableOpacity
        style={[styles.buttonStyle, { backgroundColor: '#58cdb4' }]}
        onPress={()=>onSendRequest(itemData?.distributorId)}
        
        >
        <Text style={styles.styleSubmit}>Request For Mobile No</Text>
      </TouchableOpacity>:
      
     itemData?.isAccepted==' ' &&  type ===B2CUserListTypeEnum.B2CRequest && <TouchableOpacity
        style={[styles.buttonStyle, { backgroundColor: '#58cdb4' }]}
        onPress={()=>onApproveClick(itemData?.distributorId)}
        >
        <Text style={styles.styleSubmit}>Approve</Text>
      </TouchableOpacity>}

     { itemData?.isRaised !=' '  && itemData?.isAccepted ==' ' && levelId!=1 && <Text style={{position:'absolute',top:3,right:10,color:'red',    ...Specs.fontSemibold,}}>Your request is pending</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '90%',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginVertical: 7,
    backgroundColor: '#fff',
    alignSelf: 'center',

  },
  cardImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  subHeadingText: {
    fontSize: 16,
    marginVertical: 10,
    ...Specs.fontSemibold,
    color: 'black',
  },
  text: {
    fontSize: 14,
    marginVertical: 5,
    ...Specs.fontRegular,
  },
  buttonStyle: {
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 10,
    paddingHorizontal:5,
    height: 30,
    alignSelf: 'center',
    marginBottom: 10,
  },
  styleSubmit: {
    color: '#fff',
    fontSize: 13,
    ...Specs.fontMedium,
  },
});

export default CardView;
