import React, { Component } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import AlertClass from '../../../utility/AlertClass';
import Loader from '../../../components/loader/Loader';
import autobind from 'autobind-decorator';
import { Specs } from 'app/src/utility/Theme';
import { COLOR_CODES } from '../../../utility/Theme';
import { strings } from '../../../utility/localization/Localized';
import { inject, observer } from 'mobx-react';
import { Toast } from 'app/src/components/toast/Toast';
import { observable } from 'mobx';

const deviceWidth = Dimensions.get('window').width

@inject('dashboard')
@observer
export default class DistributorFeedback extends Component {

  // @observable isLoading: Boolean = false;

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      isLoading : false
    }
  }

  @autobind
  showToast(message: string, toastType: Toast.type) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  submitMobileNo = async (item) => {
    AlertClass.showAlert('', 'Are you sure want to share your mobile no.?', [
      { text: 'Cancel', onPress: () => console.log('OK Pressed') },
      {
        text: 'Confirm',
        onPress: async () => {
          console.log('Submmit Mobile No>>>>>>>>>>>>>>>>>>',item)
          this.setState({ isLoading : true })
          const responseJSON = await this.props.dashboard.shareDistributorMobileNo(item.feedBackId)
          this.setState({ isLoading : false })
          this.showToast(responseJSON.message, responseJSON.success === false ? Toast.type.ERROR : Toast.type.SUCCESS)
        },
      },
    ]);
   
  }

  _renderItem = (item, index) => {
    const { feedbacks } = this.props;
    return (
      <View style={{ width: feedbacks.length === 1 ? deviceWidth : deviceWidth * 0.90, marginVertical: 10 }}>
        <View style={styles.feedbackContainerView}>
          <View style={[styles.contentView, index === feedbacks.length - 1 && { marginRight: 16 }]}>
            <Text style={styles.feedbackGiveBy}>{item.uplineDistributorName}</Text>
            <Text style={styles.distributorId}>{item.uplineDistributorId}</Text>
            {item.type == 2 ? (
              <Text style={styles.feedbackFor}>{`Requested ${item.downlineDistributorName}`}</Text>
            ) : (
              <Text style={styles.feedbackFor}>{`Praised ${item.downlineDistributorName}`}</Text>
            )}

            <Text style={styles.feedback}>{`"${item.message.trim()}"`}</Text>
            {
              item.type == 2 && (
                <TouchableOpacity style={[styles.submitMobile, styles.noOfProspects]} onPress={() => this.submitMobileNo(item)}>
                  <Text style={{ fontSize: 12, color: COLOR_CODES.white }}>{strings.distributorFeedBackScreen.submitTitle}</Text>
                </TouchableOpacity>
              )
            }

          </View>
        </View>
      </View>
    )
  }

  render() {
    const { feedbacks } = this.props;
    return (
      <View style={styles.containerView}>
        <View style={{ justifyContent: 'center', flexDirection: 'row', marginLeft: 10 }}>
          <Text style={styles.title}>Tap on the back</Text>
          <ActivityIndicator animating={this.state.isLoading} size="large" color="#0000ff" />
        </View>
       
        {/* <Loader loading={this.isLoading} /> */}
        <FlatList
          horizontal
          data={feedbacks}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => this._renderItem(item, index)}
          keyExtractor={(item, index) => index}
          scrollEnabled={feedbacks.length == 1 ? false : true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerView: {
    marginTop: 10,
    backgroundColor: COLOR_CODES.white
  },
  title: {
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
    textAlign: 'left',
    color: '#385070',
    fontSize: 18,
    ...Specs.fontBold
  },
  feedbackContainerView: {
    backgroundColor: COLOR_CODES.white,
    flex: 1,
    marginTop: 10,
  },
  contentView: {
    flex: 1,
    marginVertical: 10,
    marginLeft: 16,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#cfcfcf',
    backgroundColor: '#f3f7ff',
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'black',
    shadowOpacity: 0.3
  },
  feedbackGiveBy: {
    ...Specs.fontSemibold,
    fontSize: 11,
    color: '#2b3e57',
    marginTop: 12,
    marginHorizontal: 12,
  },
  distributorId: {
    ...Specs.fontSemibold,
    fontSize: 11,
    color: '#343e4a',
    marginTop: 3,
    marginHorizontal: 12,
  },
  feedbackFor: {
    ...Specs.fontMedium,
    fontSize: 14,
    color: '#2b55a4',
    marginTop: 10,
    marginHorizontal: 12,
  },
  feedback: {
    ...Specs.fontRegular,
    fontSize: 12,
    color: '#343e4a',
    marginHorizontal: 12,
    lineHeight: 18,
    paddingBottom: 8
  },
  submitMobile: {
    height: 25,
    width: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4D9CFF',
    alignSelf: 'flex-end',
    marginRight: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowOffset: {
      width: 3,
      height: 3,
    }, borderColor: '#ACDDDE',
    position: 'absolute',
    right: 0,
    borderRadius: 5
  },
});