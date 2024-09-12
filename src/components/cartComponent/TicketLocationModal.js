import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { isIphoneXorAbove } from 'app/src/utility/Utility';
import { strings } from 'app/src/utility/localization/Localized';
import { CustomButton } from 'app/src/components/buttons/Button';
import { Specs } from 'app/src/utility/Theme';
import { isNullOrEmpty } from '../../utility/Utility';

// const CLOSE_IMAGE = require('app/src/assets/images/DashBoardHeader/close.png');

/**
 * @description done temporary to meet deadline, need to be optimized with reusable code
 * */
const PickerModal = (props) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={props.pickerVisible}
      onRequestClose={() => props.setPickerVisible(!props.pickerVisible)}
      shadowOpacity={0.9}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            props.setPickerVisible(!props.pickerVisible);
          }}
          style={styles.pickerContainer}
        >
          <View style={[props.pickerContainer, styles.containerInfoIos]}>
            <View style={{
              width: 40, height: 4, marginVertical: 3, backgroundColor: '#515867', alignSelf: 'center',
            }}
            />
            <ScrollView>
              {props.pickerData.map((data) => {
                return (
                  <TouchableOpacity
                    key={data.eventId}
                    activeOpacity={1}
                    onPress={() => props.setPickerValue(data)}
                    style={props.pickerItem}
                  >
                    <Text style={props.pickerTextStyle}>
                      {`${data.location} : ${data.date} `}
                    </Text>
                  </TouchableOpacity>
                );
              })
              }
            </ScrollView>
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

/**
 * .....................Main component.....................................
 * @description It is used to show Available event location when purchasing tickets. It will be shown
 *              only for ticket type product.
 */
const TicketLocationModal = (props) => {
  const {
    isVisible = true, data, requestClose, onSubmitData,
  } = props;
  const [isPickerVisible, setPickerVisiblity] = useState({});
  const [selectedPickerObject, setSelectedObject] = useState({});
  const isLocationSelected = Object.keys(selectedPickerObject).length > 0;

  // const renderCloseIcon = () => (
  //   <TouchableOpacity
  //     style={styles.closeIcon}
  //     activeOpacity={1.0}
  //     onPress={() => requestClose(false)}
  //   >
  //     <Banner
  //       styles={{ width: 20, height: 20 }}
  //       source={CLOSE_IMAGE}
  //       resizeMode="contain"
  //     />
  //   </TouchableOpacity>
  // );

  const handlePickerSelection = (item) => {
    setSelectedObject(item);
    setPickerVisiblity(false);
  };

  const renderHeadingText = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.headingText}>Select Event Location</Text>
      </View>
    );
  };

  const renderPicker = () => {
    const pickerLabel = isLocationSelected
      ? `${selectedPickerObject.location} : ${selectedPickerObject.date}`
      : 'Select Event Location';

    return (
      <>
        <TouchableOpacity
          style={styles.pickerSelector}
          onPress={() => setPickerVisiblity(true)}
        >
          <Text>{pickerLabel}</Text>
          <FontAwesome name="caret-down" size={25} color="#515867" />
        </TouchableOpacity>
        <PickerModal
          pickerKey={111}
          pickerVisible={isPickerVisible}
          pickerContainer={styles.customPickerContainer}
          pickerTextStyle={styles.pickerTextStyle}
          pickerItem={styles.pickerItem}
          pickerData={data}
          setPickerValue={handlePickerSelection}
          setPickerVisible={setPickerVisiblity}
        />
      </>
    );
  };

  const labelValueText = (label, value) => {
    if (label === 'eventId' || label === 'extraDetails') {
      return null;
    }
    return (
      <View style={styles.detailsItemContainer}>
        <Text style={[styles.detailsData, styles.detailsLeftData]} numberOfLines={2}>{label}</Text>
        <Text style={[styles.detailsData, styles.detailsRightData]} numberOfLines={4}>{value}</Text>
      </View>
    );
  };

  const renderDetails = () => {
    console.log('check',selectedPickerObject)
    return (
      <View style={styles.ticketDetails}>
        {Object.keys(selectedPickerObject)?.map(value => labelValueText(value, selectedPickerObject[value]))}
        {selectedPickerObject?.extraDetails?.map(item => labelValueText(item?.label, item?.value))}
      </View>
    );
  };

  const renderBottom = () => {
    return (
      <View style={{
        height: 60, flexDirection: 'row', justifyContent: 'space-evenly', paddingHorizontal: 10,
      }}
      >
        <CustomButton
          buttonContainer={[styles.button, { backgroundColor: '#15AA94' }]}
          handleClick={async () => requestClose()}
          buttonTitle="CANCEL"
          buttonTitleStyle={styles.customButtonTitleStyle}
        />
        <CustomButton
          disabled={!isLocationSelected}
          buttonContainer={[styles.button, { backgroundColor: '#6797D4' }]}
          handleClick={async () => onSubmitData(selectedPickerObject?.eventId)}
          buttonTitle="PROCEED"
          buttonTitleStyle={styles.customButtonTitleStyle}
        />
      </View>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={isVisible}
      onRequestClose={() => requestClose(false)}
    >
      <View style={styles.mainContainer}>
        <View style={[styles.containerInfo, Platform.OS === 'ios' ? styles.containerInfoIos : styles.containerInfoAndroid]}>
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              {renderHeadingText()}
              {/* {renderCloseIcon()} */}
            </View>
            {renderPicker()}
            {isLocationSelected && renderDetails()}
          </View>
          {renderBottom()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000050',
  },
  containerInfo: {
    width: Dimensions.get('window').width - 40,
    height: '60%',
    backgroundColor: 'white',
    borderRadius: 6,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    height: 40,
    backgroundColor: '#e9f0f9',
    padding: 7.5,
  },
  headingText: {
    ...Specs.fontBold,
    alignSelf: 'center',
  },
  // closeIcon: {
  //   // position: 'absolute',
  //   // right: 8,
  //   // top: 8,
  //   height: 30,
  //   width: 30,
  //   backgroundColor: '#262626',
  //   borderRadius: 15,
  //   padding: 5,
  // },
  containerInfoIos: {
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#e1e5e6',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  containerInfoAndroid: {
    elevation: 15,
  },
  pickerSelector: {
    flexDirection: 'row',
    margin: 10,
    height: 40,
    borderRadius: 5,
    borderWidth: 0.8,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#515867',
  },
  pickerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  pickerItem: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    borderBottomWidth: 0.6,
    borderColor: '#e9f0f9',
  },
  customPickerContainer: {
    width: Dimensions.get('window').width - 5,
    maxHeight: '50%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderStyle: 'solid',
    elevation: 40,
    marginBottom: 5,
    paddingTop: 8,
    backgroundColor: '#f7fafd',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  detailsItemContainer: {
    flexDirection: 'row',
    minHeight: 30,
  },
  ticketDetails: {
    backgroundColor: '#fff',
    marginVertical: 10,
    marginHorizontal: 15,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  pickerTextStyle: {
    fontSize: 13,
    ...Specs.fontMedium,
    color: '#000',
  },
  detailsData: {
    ...Specs.fontMedium,
    fontSize: 13,
    color: '#6c7a87',
  },
  detailsLeftData: {
    ...Specs.fontBold,
    flex: 0.3,
  },
  detailsRightData: {
    flex: 0.7,
  },
  customButtonTitleStyle: {
    fontSize: 14,
    ...Specs.fontSemibold,
    alignSelf: 'center',
    color: '#fff',
  },
  button: {
    height: 35,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4DA1CC',
    paddingHorizontal: 25,
    borderRadius: 5,
  },
});

export default TicketLocationModal;
