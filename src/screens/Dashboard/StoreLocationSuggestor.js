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
  Linking
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { isIphoneXorAbove, showToast } from 'app/src/utility/Utility';
import { strings } from 'app/src/utility/localization/Localized';
import Share from 'react-native-share';
import { VESTIGE_IMAGE } from '../../utility/constant/Constants';

const CLOSE_IMAGE = require('../../assets/images/DashBoardHeader/close.png');


export default function StoreLocationSuggestor({ isVisible, closeStoreLocationSuggestor, nearbyStoreList, selectStorePickup }) {

  function shareLocation(branchCoordinate)  {
    if(branchCoordinate) {
      const { latitude, longitude } = branchCoordinate
      const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${latitude},${longitude}`;
      const label = 'Vestige';
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
      });
      Linking.openURL(url); 
    }
    else {
      showToast('No Coordinates Found for this location.')
    }
  }

  return (
    <Modal 
      animationType="slide" 
      visible={isVisible} 
      transparent 
      onRequestClose={() => closeStoreLocationSuggestor()}
    >
      <View style={styles.mainContainerInfo}>
        <View style={[styles.containerInfo, Platform.OS === 'ios' ? styles.containerInfoIos : styles.containerInfoAndroid]}>
          <View style={{flexDirection: 'row', justifyContent: 'flex-end', width: '100%'}}>
            <TouchableOpacity style={{padding: 10 }} onPress={() =>{ closeStoreLocationSuggestor()}}>
              <Image
                style={styles.closeButton}
                source={CLOSE_IMAGE}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View style={[styles.headerInfo, {position: 'absolute', top: 10}]}>
            <Text style={styles.headingText}>Stores Near You</Text>
          </View>
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={nearbyStoreList}
            renderItem={({item}) => (
              <TouchableOpacity
                activeOpacity={1}
                onPress={()=>{
                  selectStorePickup(item);
                }}
                accessible={false}
              >
                <View style={styles.storeLocationContainer}>
                  <View>
                    <Text style={styles.storeLocationNameTextStyle}>{item.locationName}</Text>
                    <Text style={[styles.storeLocationTimeingsDistanceTextStyle,{ marginTop: 7, marginBottom: 3 }]}>{`${strings.locationScreen.timingsKey}${item.timings}`}</Text>
                    {item.distance && (
                      <Text style={styles.storeLocationTimeingsDistanceTextStyle}>{`${strings.locationScreen.distanceKey}${item.distance}`}</Text>
                    )}
                  </View>
                  <TouchableOpacity 
                    // onPress={()=> shareLocation(item.geoLocation) }
                    onPress={()=> selectStorePickup(item)}
                    style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 1, alignItems: 'center', paddingHorizontal: 10}}
                  >
                    <Image source={VESTIGE_IMAGE.STORE_LOCATION_ICON} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
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
    justifyContent: 'center',
    backgroundColor: '#00000040',
  },
  containerInfo: {
    width: Dimensions.get('window').width - 100,
    // height: Dimensions.get('window').height - (isIphoneXorAbove() ? 250 : 185),
    marginTop: isIphoneXorAbove() ? 70 : 40,
    marginBottom: isIphoneXorAbove() ? 110 : 65,
    marginLeft: 15,
    marginRight: 15,
    // alignItems: 'center',
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
    paddingHorizontal: 15,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: {
    color: '#3f5886',
    fontSize: 16,
    ...Specs.fontBold, 
    textAlign:'center',
  },
  closeButton: {
    width: 30,
    height: 30,
  },
  storeLocationContainer: {
    marginLeft: 15,
    flex: 1, 
    paddingVertical: 10,
    flexDirection: 'row', 
    alignItems: 'center',
  },
  storeLocationNameTextStyle: {
    color: '#363636',
    fontSize: 16,
  },
  storeLocationTimeingsDistanceTextStyle: {
    fontSize: 12,
    color: '#6C6C6C',
  },
});
