
/**
 * @description Component use to display Popup modal view  for training budgets
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
} from 'react-native';
import { CustomButton } from 'app/src/components/buttons/Button';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';

const CLOSE_IMAGE = require('app/src/assets/images/DashBoardHeader/close.png');

function listData(title, value) {
  return (
    <View style={styles.textContainer}>
      <Text style={styles.titleText}>
        {title}
      </Text>
      <Text style={styles.subTitleText}>
        {value}
      </Text>
    </View>
  );
}

function showData(obj) {

  const { item } = obj.props;
  let budgetForVenueRent = '';
  let budgetForTravel = '';
  let budgetForHotel = '';
  let budgetForFood = '';
  let budgetForMisc = '';
  let budgetForHonorariumCharges = '';
  const priceSign = 'Rs. '
  if (item && item.budgetForVenueRent != null) {
    budgetForVenueRent = priceSign + item.budgetForVenueRent;
  }
  if (item && item.budgetForTravel != null) {
    budgetForTravel = priceSign + item.budgetForTravel
  }
  if (item  && item.budgetForHotel != null) {
    budgetForHotel = priceSign + item.budgetForHotel;
  }
  if (item && item.budgetForFood != null) {
    budgetForFood = priceSign + item.budgetForFood;
  }
  if (item && item.budgetForMisc != null) {
    budgetForMisc = priceSign + item.budgetForMisc;
  }
  if (item && item.budgetForHonorariumCharges != null) {
    budgetForHonorariumCharges = priceSign + item.budgetForHonorariumCharges;
  }
  return (
    <View style={styles.backgroundContainer}>
      {budgetForVenueRent.length > 0 ? listData(strings.myTrainingScreen.venueRent, budgetForVenueRent) : null}
      {budgetForTravel.length > 0 ? listData(strings.myTrainingScreen.travel, budgetForTravel) : null}
      {budgetForHotel.length > 0 ? listData(strings.myTrainingScreen.hotel, budgetForHotel) : null}
      {budgetForFood.length > 0 ? listData(strings.myTrainingScreen.food, budgetForFood) : null}
      {budgetForMisc.length > 0 ? listData(strings.myTrainingScreen.misc, budgetForMisc) : null}
      {budgetForHonorariumCharges.length > 0 ? listData(strings.myTrainingScreen.honorarium, budgetForHonorariumCharges) : null}
    </View>
  );
}

export default function getTrainingBudgetsPopUpView(obj) {
  const { item } = obj.props;
  return (
    <Modal animationType="slide" visible={obj.state.showModal} transparent onRequestClose={() => {}}>
      <View style={styles.mainContainerInfo}>
        <View style={styles.containerInfo}>
          <View style={styles.headerInfo}>
            <Text style={styles.headingText}>
            PROJECTED BUDGETS
            </Text>
            <TouchableOpacity
              onPress={() =>{ obj.setState({ showModal: false }) }}
            >
              <Image
                style={styles.closeButton}
                source={CLOSE_IMAGE}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          {showData(obj)}
          {/* <CustomButton
            {...obj.props}
            isDisabled={false}
            handleClick={() => obj.editTrainingButtonPressed(item)}
            linearGradient
            buttonContainer={styles.button}
            buttonTitle="Edit Training"
            buttonTitleStyle={styles.customButtonTitleStyle}
            primaryColor="#6895d4"
            secondaryColor="#57a5cf"
          /> */}
        </View>
      </View>
    </Modal>
  );
}


/**
 * @description: This is the training budgets Popup modal stylesheet
 */
const styles = StyleSheet.create({
  mainContainerInfo: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: '#00000040',
    justifyContent: 'center',
  },
  containerInfo: {
    width: Dimensions.get('window').width - 20,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
  },
  headerInfo: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headingText: {
    color: '#6797d4',
    alignSelf: 'center',
    marginLeft: 110,
    ...Specs.fontSemiBold,
  },
  closeButton: {
    width: 30,
    height: 30,
    marginRight: 20
  },
  backgroundContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  textContainer: {
    width: Dimensions.get('window').width - 80,
    height: 30,
    marginTop: 5,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  titleText: {
    color: '#3f4967',
    ...Specs.fontRegular,
    fontSize: 14,
  },
  subTitleText: {
    color: '#3f4967',
    ...Specs.fontMedium,
    fontSize: 14,
  },
  button: {
    marginTop: '7%',
    marginLeft: 16,
    marginRight: 16,
    marginBottom: '7%',
    width: '70%',
  },
  customButtonTitleStyle: {
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
    ...Specs.fontMedium,
  },
});
