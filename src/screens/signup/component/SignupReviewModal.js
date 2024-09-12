/**
 * @description Use to make Banner View
 */
import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Modal,
  StatusBar,
  FlatList,
  Platform
} from 'react-native';
import { CustomButton, Checkbox } from 'app/src/components/buttons/Button';
// import Loader from 'app/src/components/loader/Loader';
import { Specs } from 'app/src/utility/Theme';
// import AlertClass from 'app/src/utility/AlertClass';
import { strings } from 'app/src/utility/localization/Localized';


const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  mainContainer: {
    // width: '100%',
    // height: '100%',
    flex:1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#00000070',
  },
  modalContainer: {
    width: '97%',
    alignSelf: 'center',
    height: Platform.OS=== 'android'?(height - 50 - StatusBar.currentHeight):(height - 70),
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    // alignItems: 'center',
    overflow: 'hidden',
  },
  button: {
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: 5,
    width: 160,
  },
  modalHeadingContainer: {
    backgroundColor: '#E4EDF4',
    width: '100%',
    height: 40,
    justifyContent: 'center',
  },
  modalHeading: {
    color: '#2D7FFB',
    fontSize: 16,
    ...Specs.fontBold,
    textAlign: 'center',
  },
  headingText: {
    // color: '#2D7FFB',
    fontSize: 15,
    ...Specs.fontBold,
  },
  descriptionText: {
    // color: '#2D7FFB',
    fontSize: 15,
    ...Specs.fontRegular,
    // marginLeft: 5,
  },
  customButtonTitleStyle: {
    ...Specs.fontBold,
    fontSize: 16,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  declarationContainer: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 5,
    marginTop: 10,
    marginLeft: 10,
  },
});

export default class SignupReviewModal extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      isDeclarationAccepted: false,
    };
  }

  renderItem = (item) => {
    if (item?.heading) {
      return (
        <View style={{ marginVertical: 5, marginHorizontal: 10 }}>
          <Text style={styles.headingText}>{item.heading}</Text>
          <Text style={styles.descriptionText}>{item.data}</Text>
        </View>
      );
    }
    return null;
  }

  renderDeclaration = () => {
    return (
      <View style={styles.declarationContainer}>
        <Checkbox
          label={strings.errorMessage.completeRegistration.acceptDeclaration}
          overrideStyles={{ marginRight: 30, marginLeft: 10, height: 60 }}
          isSelected={this.state.isDeclarationAccepted}
          getQuantity={() => this.setState(prevState => ({ isDeclarationAccepted: !prevState.isDeclarationAccepted }))}
        />
      </View>
    );
  }

  render() {
    const {
      isVisible,
      submitData,
      reviewData,
      closeReviewModal,
    } = this.props;

    return (
      <Modal
        animationType="slide"
        transparent
        visible={isVisible}
        onRequestClose={() => closeReviewModal()}
      >
        <View style={styles.mainContainer}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeadingContainer}>
              <Text style={styles.modalHeading}>{strings.signupReview.modalHeading}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <FlatList
                contentContainerStyle={{ paddingVertical: 5, paddingHorizontal: 15 }}
                data={reviewData}
                // extraData={this.state}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => this.renderItem(item)}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
            {this.renderDeclaration()}
            <View style={{ height: 60, flexDirection: 'row', justifyContent: 'center' }}>
              <CustomButton
                {...this.props}
                handleClick={() => closeReviewModal()}
                // disabled={!this.state.isDeclarationAccepted}
                buttonContainer={[styles.button]}
                linearGradient
                buttonTitle={strings.signupReview.cancel}
                buttonTitleStyle={styles.customButtonTitleStyle}
                primaryColor="#6895d4"
                secondaryColor="#57a5cf"
              />
              <CustomButton
                {...this.props}
                handleClick={() => submitData()}
                disabled={!this.state.isDeclarationAccepted}
                buttonContainer={[styles.button]}
                linearGradient
                buttonTitle={strings.signupReview.submit}
                buttonTitleStyle={styles.customButtonTitleStyle}
                primaryColor="#58cdb4"
                secondaryColor="#58cdb4"
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}
