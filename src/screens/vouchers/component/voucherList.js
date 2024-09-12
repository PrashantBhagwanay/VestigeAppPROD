import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Clipboard,
  TouchableOpacity
} from 'react-native';
import { dateFormat, showToast } from 'app/src/utility/Utility';
import { Specs } from 'app/src/utility/Theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Toast } from 'app/src/components/toast/Toast';
import { strings } from 'app/src/utility/localization/Localized';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import moment from 'moment';

const voucherList = ({voucherDataList, isLoading, handleRenewVoucher}) => {

  const renderRenewButton = (item) => {
    return(
      <View style={{paddingHorizontal:5, flexDirection:'row-reverse'}}>
        <TouchableOpacity
          style={styles.renewVoucher} 
          onPress={async ()=> handleRenewVoucher(item)}
        >
          <Text style={[styles.rightTextStyle, {color:'#578BD3', fontSize:13}]}>Renew</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderRenewVoucherMessage = (item) => {
    if(item.renewPendingMessage && item.renewPendingMessage != ''){
      return(
        <View style={styles.messageView}>
          <Text style={[{...Specs.fontMedium, color:'#578BD3', fontSize:12}]}>{item.renewPendingMessage}</Text>
        </View>
      )
    }
  }

  const renderCopyButton = (item) => {
    const currentDate = moment().format('YYYY-MM-DD');
    const expiryDate = moment(item.validTill).format('YYYY-MM-DD');
    if(moment(currentDate).isBefore(expiryDate)){
      return(
        <TouchableOpacity
          style={{paddingHorizontal: 5}} 
          onPress={async ()=> { 
            await Clipboard.setString(item.voucherNo)
            showToast(strings.referralScreen.copiedToCLipBoardTitle,  Toast.type.SUCCESS) 
          }}
        >
          <Icon name='content-copy' style={{paddingHorizontal: 5}} size={20} color='#3f4967' />
        </TouchableOpacity>
      )
    }
  }

  return(
    <FlatList
      style={{marginTop:9}}
      data={voucherDataList}
      keyExtractor={(_, i) => i.toString()}
      contentContainerStyle={voucherDataList.length === 0 && styles.emptyScreenView}
      ListEmptyComponent={isLoading ? null : <EmptyScreen myVouchers />} 
      renderItem={({item})=> item.voucherNo!='null' && (
        <View key={item.voucherNo} style={styles.listComponentContainer}>
          {item.voucherNo != 'null' &&  (  
            (item.voucherStatus.toUpperCase() === 'FREE'  )?(
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={[styles.VoucherNoTitleStyle, { color: '#31cab3' }]}>
                  {(item.voucherNo == 'null') ? 'N/A': `${strings.voucherList.voucherNo}: ${item.voucherNo}`}
                </Text>
                {renderCopyButton(item)}
              </View>
            ):(
              <Text style={[styles.VoucherNoTitleStyle, { color: '#d0021b' }]}>
                {(item.voucherNo == 'null') ? 'N/A': `${strings.voucherList.voucherNo}: ${item.voucherNo}`}
              </Text>
            ))
          }  
          <View style={styles.voucherInfo}>
            <View style={styles.listTextRowContainer}>
              {
                (item.validTill) ? (
                  <View style={styles.textRowContainer}>
                    <Text style={styles.leftTextStyle}>{strings.voucherList.valid}</Text>
                    <Text style={styles.rightTextStyle}>{moment(item.validTill).format('DD/MM/YYYY')}</Text>
                  </View>
                ) : null 
              }
              {
                (item.voucherStatus!='null')?(
                  <View style={styles.textRowContainer}>
                    <Text style={styles.leftTextStyle}>{strings.voucherList.voucherStatus}</Text>
                    <Text style={styles.rightTextStyle}>{item.voucherStatus}</Text>
                  </View>
                ):null
              }
              {
                (item.invoiceNo && item.invoiceNo !='null')?(
                  <View style={styles.textRowContainer}>
                    <Text style={styles.leftTextStyle}>{strings.voucherList.invoiceNo}</Text>
                    <Text style={styles.rightTextStyle}>{item.invoiceNo }</Text>
                  </View>
                ):null
              }
              {
                (item.invoiceDate)?(
                  <View style={styles.textRowContainer}>
                    <Text style={styles.leftTextStyle}>{strings.voucherList.invoiceDate}</Text>
                    <Text style={styles.rightTextStyle}>{moment(item.invoiceDate).format('DD/MM/YYYY')}</Text>
                  </View>
                ):null
              }
              {
                (item.amount)?(
                  <View style={styles.textRowContainer}>
                    <Text style={styles.leftTextStyle}>{strings.voucherList.voucherAmount}</Text>
                    <Text style={styles.rightTextStyle}>{Number(item.amount).toFixed(2)}</Text>
                  </View>
                ):null
              }
              {item.renewStatus == '1'  ? renderRenewButton(item) : null}
              {renderRenewVoucherMessage(item)}
            </View>
          </View>
        </View>
      )}
    />
  );
};

const styles=StyleSheet.create({
  listComponentContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 1,
    paddingTop:13,
    paddingHorizontal: 14
  },
  voucherInfo: {
    paddingBottom:11
  },
  VoucherNoTitleStyle: {
    ...Specs.fontSemibold,
    // marginLeft: 18,
    fontSize: 14
  },
  listTextRowContainer: {
    flexDirection: 'column',
    marginTop: 10
  },
  textRowContainer: {
    flexDirection: 'row',
    marginLeft: 18,
    marginTop:4
  },
  leftTextStyle: {
    ...Specs.fontRegular,
    color: '#3f4967',
    fontSize: 12,
    flex: 0.4,
  },
  rightTextStyle: {
    ...Specs.fontMedium,
    color: '#3f4967',
    fontSize: 12,
    flex: 0.6,
  },
  emptyScreenView: {
    flex:1, 
    marginBottom:1,
    justifyContent:'center',
    alignItems:'center',
  },
  renewVoucher:{
    justifyContent:'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical:5,
    borderRadius: 15,
    // borderWidth:0.5,
    // borderColor: '#578BD3',
    backgroundColor: '#578BD325',
  },
  messageView:{
    flexDirection:'row',
    marginVertical: 10,
    paddingHorizontal:8,
    paddingVertical: 2,
    borderColor: '#00000025',
    borderRadius: 5,
    borderWidth: 1 
  }
});

export default voucherList;