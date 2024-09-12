/**
 * @description Component use to display Popup modal view 
 */
import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { WinnerEnum } from 'app/src/utility/constant/Constants';
import { strings } from 'app/src/utility/localization/Localized';
import Banner from 'app/src/screens/Dashboard/Banner';
import { isIphoneXorAbove } from 'app/src/utility/Utility';

const CLOSE_IMAGE = require('../../assets/images/DashBoardHeader/close.png');
const TOPCARWINNER = require('../../assets/images/DashBoardHeader/carFunds.png');
const TOPHOMEWINNER = require('../../assets/images/DashBoardHeader/homeFunds.png');
const TOPTRIPWINNER = require('../../assets/images/DashBoardHeader/tripFunds.png');

function getNameInitials(title){
  let initials = title.match(/\b\w/g) || [];
  initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
  return initials;
}

function colorize(str) {
  for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
  const color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1 * 16777216)).toString(16);
  return '#' + Array(6 - color.length + 1).join('0') + color;
}

function listData(title) {
  return (
    <View style={styles.textContainer}>
      <View style={{width: 40, height: 40, borderRadius: 40, backgroundColor: colorize(title), justifyContent: 'center', alignItems: 'center'}}>
        <Text style={[styles.titleText, {color: 'white'}]}>{getNameInitials(title)}</Text>
      </View>
      <Text style={[styles.titleText, {marginLeft: 10,}]}>{title}</Text>
    </View>
  );
}

export default function getPopupModalViewForWinnerDetail(winnerType ,showWinner, winners, changeModalState, lazyload, winnersList, winersCount) {
  let title = '';
  let value = '';
  let isShowTopImage = true;
  let topImageName = null;
  if (!winnersList) {
    winnersList = winners.slice(0 , 20)
  }

  if (winnerType === WinnerEnum.CarWinner){
    title = strings.winnerDetailModalBox.topCarWinners;
    value = 'Audi A5';
    isShowTopImage = false;
    topImageName = TOPCARWINNER;
  }
  else if (winnerType === WinnerEnum.HomeWinner){
    title = strings.winnerDetailModalBox.topHomeWinners;
    topImageName = TOPHOMEWINNER;
  }
  else if (winnerType === WinnerEnum.TripWinner){
    title = strings.winnerDetailModalBox.topTripWinners;
    value = 'England';
    topImageName = TOPTRIPWINNER;
  }
  return (
    <Modal animationType="fade" visible={showWinner} transparent onRequestClose={() => {}}>
      <View style={styles.mainContainerInfo}>
        <View style={[styles.containerInfo, Platform.OS === 'ios' ? styles.containerInfoIos : styles.containerInfoAndroid]}>
          <Banner
            styles={styles.topImageBackgroundStyle}
            resizeMode="contain"
            source={topImageName}
          />
          <View style={{flexDirection: 'row', justifyContent: 'flex-end', width: '100%'}}>
            <TouchableOpacity style={{padding: 10,}} onPress={() => setTimeout(() => {
              changeModalState()
            }, 100)}>
              <Image
                style={styles.closeButton}
                source={CLOSE_IMAGE}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View style={[styles.headerInfo, {position: 'absolute', top: 10}]}>
            <Text style={styles.headingText}>{title}</Text>
          </View>
          <View style={[styles.headerInfo, { borderRadius: 16, borderWidth: 1.5, borderColor: '#3f5886', marginBottom: 12}]}>
            <Text style={styles.headingText}>{winersCount}</Text>
          </View>
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={winnersList}
            contentContainerStyle={winnersList.length === 0 && styles.emptyData}
            renderItem={({item}) => { return listData(item)}}
            ListEmptyComponent={<Text style={styles.titleText}>{strings.winnerDetailModalBox.noDataFoundText}</Text>}
            onEndReached={() => { lazyload()}}
            onEndReachedThreshold={.7} 
            extraData={winnersList}
          />
        </View>
      </View>
    </Modal>
  );
}

/**
 * @description: This is the Popup modal stylesheet
 */
const styles = StyleSheet.create({
  mainContainerInfo: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: '#00000040',
  },
  containerInfo: {
    width: Dimensions.get('window').width - 30,
    height: Dimensions.get('window').height - (isIphoneXorAbove() ? 180 : 105),
    marginTop: isIphoneXorAbove() ? 70 : 40,
    marginBottom: isIphoneXorAbove() ? 110 : 65,
    marginLeft: 15,
    marginRight: 15,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 4,
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
  headerInfo: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topImageBackgroundStyle: {
    width: '100%',
    height: 105,
    position: 'absolute',
    opacity: 10
  },
  headingText: {
    color: '#3f5886',
    fontSize: 16,
    ...Specs.fontSemiBold, 
    textAlign:'center',
  },
  closeButton: {
    width: 30,
    height: 30,
  },
  textContainer: {
    width: Dimensions.get('window').width - 80,
    height: 36,
    marginVertical: 10,
    marginLeft: 10,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titleText: {
    color: '#263241',
    fontSize: 14,
    ...Specs.fontMedium, 
  },
  emptyData: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
  }
});
