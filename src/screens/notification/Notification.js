/**
 * @description Use to make My Notification screen
 */
import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import autobind from 'autobind-decorator';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import Icon from 'react-native-vector-icons/FontAwesome';
// import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import moment from 'moment';
import Loader from 'app/src/components/loader/Loader';
import { connectedToInternet, isNullOrEmpty } from 'app/src/utility/Utility';
import OfflineNotice from 'app/src/components/OfflineNotice';

// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Header } from '../../components';
const PROFILE_IMAGE = require('app/src/assets/images/Brands/placeholder.png');
const SCREEN_WIDTH = Dimensions.get('window').width;

@inject('profile')
@observer
class Notification extends Component {
  @observable selectedRow;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.props = props;
    makeObservable(this);
    this.component = [];
    this.selectedfilterItem = {
      isSelected: true,
      name: '7 Days',
      filterKey: '7',
    };
    // this.selectedRow;
    this.state = {
      // deletedId: '',
      data: [],
      isRefreshing: true,
      refreshKey: 0,
      arrayFilterDate: [
        { isSelected: true, name: '7 Days', filterKey: '7' },
        { isSelected: false, name: '15 Days', filterKey: '15' },
        { isSelected: false, name: '30 Days', filterKey: '30' },
      ],
    };
    this.isInternetConnected = true;
  }

  async componentDidMount() {
    this.getNotificationsData(this.selectedfilterItem.filterKey);
  }

  async getNotificationsData(filterData) {
    this.isInternetConnected = await connectedToInternet();
    if (this.isInternetConnected)
      await this.props.profile.getNotification(filterData);
    const formataray = this.props.profile.notification?.map((item, index) => {
      item.key = index;
      return item;
    });
    this.setState({
      data: formataray,
    });
  }

  @autobind
  async networkStatus(status) {
    if (status) {
      this.isInternetConnected = status;
      await this.props.profile.getNotification();
    }
  }

  deleteNotification = (item, index) => {
    Alert.alert(
      strings.commonMessages.alert,
      strings.cartListProduct.removeItem,
      [
        {
          text: strings.commonMessages.ok,
          onPress: () => this.deleteNotificationAfterConformation(item, index),
        },
        { text: strings.commonMessages.cancel, onPress: () => {} },
      ],
      { cancelable: false },
    );
  };

  deleteAllNotificationAfterConformation = async () => {
    const status = await this.props.profile.deleteNotification('ALL', 0);
    if (status) {
      this.selectedRow = '';
      this.setState(prevState => ({ refreshKey: prevState.refreshKey + 1 }));
      // await this.props.profile.getNotification(this.selectedfilterItem.filterKey);
      this.getNotificationsData(this.selectedfilterItem.filterKey);
    }
  };

  deleteNotificationAfterConformation = async (item, index) => {
    const status = await this.props.profile.deleteNotification(item.id, index);
    if (status) {
      this.selectedRow = '';
      this.setState(prevState => ({ refreshKey: prevState.refreshKey + 1 }));
      // await this.props.profile.getNotification(this.selectedfilterItem.filterKey);
      this.getNotificationsData(this.selectedfilterItem.filterKey);
    }
  };

  onPressDateFilter = (item, index) => {
    const arr = this.state.arrayFilterDate;
    arr.map(userData => {
      userData.isSelected = false;
    });
    arr[index].isSelected = !item?.isSelected;
    // this.setState({ arrayFilterDate: arr, isRefreshing: true });
    this.selectedfilterItem = arr[index];
    this.setState({ arrayFilterDate: arr, isRefreshing: true }, () => {
      this.setState({ isRefreshing: false });
      this.getNotificationsData(this.selectedfilterItem.filterKey);
    });
  };

  onRowOpen = (rowKey, rowMap) => {
    if (
      !isNullOrEmpty(this.selectedRow) &&
      this.selectedRow !== rowMap[rowKey]
    ) {
      this.selectedRow?.closeRow();
    }
    this.selectedRow = rowMap[rowKey];
  };

  headerFilterByDate = () => {
    return (
      <View style={styles.headerContentView}>
        <FlatList
          refreshing={this.state.isRefreshing}
          horizontal
          data={this.state.arrayFilterDate}
          keyExtractor={(_, index) => index.toString()}
          extraData={this.state.arrayFilterDate}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.filterCell,
                {
                  backgroundColor: item?.isSelected ? '#6797d4' : 'white',
                  borderWidth: 1,
                  borderColor: item?.isSelected ? 'white' : '#6797d4',
                },
              ]}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  height: 40,
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => this.onPressDateFilter(item, index)}>
                  <Text
                    style={{
                      ...Specs.fontMedium,
                      fontSize: 14,
                      color: item?.isSelected ? 'white' : '#515867',
                    }}>
                    {item.name ? item.name : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    );
  };

  headerContent = () => {
    return (
      <View style={styles.headerContentView}>
        <View
          style={{
            width: '70%',
            height: '100%',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: 'white',
            }}>{`You can delete single message by swiping right or delete all from "Delete All" button.`}</Text>
        </View>
        <TouchableOpacity
          style={{
            width: '30%',
            alignItems: 'flex-end',
            justifyContent: 'center',
            height: 30,
          }}
          onPress={() => {
            Alert.alert(
              strings.commonMessages.alert,
              'Do you want to remove all Notifications?',
              [
                {
                  text: strings.commonMessages.ok,
                  onPress: () => this.deleteAllNotificationAfterConformation(),
                },
                { text: strings.commonMessages.cancel, onPress: () => {} },
              ],
              { cancelable: false },
            );
          }}>
          <View
            style={{
              width: '80%',
              alignItems: 'center',
              justifyContent: 'center',
              height: 30,
              borderColor: '#fafbfc',
              borderWidth: 2,
            }}>
            <Text style={{ color: 'white', fontSize: 12 }}>Delete All</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // makeListCell = () => {
  //   const { deletedId } = this.state;
  //   return (
  //     <FlatList
  //       key={this.state.refreshKey}
  //       data={this.props.profile.notification}
  //       keyExtractor={(_, index) => index.toString()}
  //       extraData={this.props.profile.notification}
  //       contentContainerStyle={this.props.profile.notification.length === 0 && styles.emptyScreenView}
  //       ListEmptyComponent={this.props.profile.isLoading ? <ActivityIndicator size="large" color="#5988e0" /> : <EmptyScreen notifications />}
  //       renderItem={({ item, index }) => (
  //         <View style={styles.cellViewInFront}>
  //           <SwipeRow
  //             extraData={deletedId}
  //             ref={(c) => { this.component[item.key] = c; }}
  //             rightOpenValue={-75}
  //             onRowOpen={() => {
  //               if (this.selectedRow && this.selectedRow !== this.component[item.key]) {
  //                 if (this.selectedRow._root) {
  //                   this.selectedRow._root.closeRow();
  //                 }
  //               }
  //               this.selectedRow = this.component[item.key];
  //             }}
  //             body={
  //               (
  //                 <View style={{ width: SCREEN_WIDTH - 10, flexDirection: 'row', justifyContent: 'space-between' }}>
  //                   <View style={{ paddingLeft: 9, paddingRight: 5, width: item.imageURL ? SCREEN_WIDTH - 110 : SCREEN_WIDTH - 20 }}>
  //                     <Text style={{
  //                       ...Specs.fontMedium, fontSize: 14, color: '#515867', paddingBottom: 11,
  //                     }
  //                     }
  //                     >
  //                       {item.title ? item.title : ''}
  //                     </Text>
  //                     <Text style={{
  //                       ...Specs.fontRegular, fontSize: 12, color: '#515867', paddingBottom: 11,
  //                     }}
  //                     >
  //                       {item.notificationMessage ? item.notificationMessage : ''}
  //                     </Text>
  //                     <Text style={styles.dateStyles}>
  //                       {item.createdOn ? moment(item.createdOn).format('Do MMMM YYYY  |  h:mm a') : ''}
  //                     </Text>
  //                   </View>
  //                   <View style={{ paddingLeft: 9, paddingRight: 10, opacity: item.imageURL ? 1 : 0 }}>
  //                     <Image
  //                       style={{ width: 80, height: 80 }}
  //                       resizeMode="contain"
  //                       source={item.imageURL ? { uri: item.imageURL } : PROFILE_IMAGE}

  //                     />
  //                   </View>
  //                 </View>
  //               )
  //             }
  //             right={
  //               (
  //                 <TouchableOpacity style={styles.deleteIconInBack} onPress={() => this.deleteNotification(item, index)}>
  //                   <Icon name="trash-o" size={30} color="#fff" />
  //                 </TouchableOpacity>
  //               )
  //             }
  //           />
  //         </View>
  //       )}
  //     />
  //   );
  // }

  renderHiddenItem = rowData => {
    return (
      <View style={styles.rowBack}>
        <TouchableOpacity
          style={styles.deleteIconRight}
          onPress={() =>
            this.deleteNotification(rowData?.item, rowData?.index)
          }>
          <Icon name="trash-o" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  renderItem = rowData => {
    return (
      <View style={styles.cellViewInFront}>
        <View
          style={{
            paddingVertical: 10,
            // width: SCREEN_WIDTH - 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              paddingLeft: 9,
              paddingRight: 5,
              flex: 1,
            }}>
            <Text
              style={{
                ...Specs.fontMedium,
                fontSize: 14,
                color: '#515867',
                paddingBottom: 11,
              }}>
              {rowData.item.title ? rowData.item.title : ''}
            </Text>
            <Text
              style={{
                ...Specs.fontRegular,
                fontSize: 12,
                color: '#515867',
                paddingBottom: 11,
              }}>
              {rowData.item.notificationMessage
                ? rowData.item.notificationMessage
                : ''}
            </Text>
            <Text style={styles.dateStyles}>
              {rowData.item.createdOn
                ? moment(rowData.item.createdOn).format(
                    'Do MMMM YYYY  |  h:mm a',
                  )
                : ''}
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: 5,
              opacity: rowData.item.imageURL ? 1 : 0.6,
            }}>
            <Image
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
              source={
                rowData.item.imageURL
                  ? { uri: rowData.item.imageURL }
                  : PROFILE_IMAGE
              }
            />
          </View>
        </View>
      </View>
    );
  };

  makeListCell = () => {
    return (
      <View style={styles.listContainer}>
        <SwipeListView
          useFlatList={true}
          key={this.state.refreshKey}
          keyExtractor={item => item.key}
          data={this.state.data}
          renderItem={this.renderItem}
          renderHiddenItem={this.renderHiddenItem}
          rightOpenValue={-75}
          onRowOpen={this.onRowOpen}
        />
      </View>
    );
  };

  render() {
    const { profile } = this.props;
    return !this.isInternetConnected ? (
      <OfflineNotice networkStatus={status => this.networkStatus(status)} />
    ) : (
      <View style={styles.mainView}>
        <Loader loading={this.props.profile.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.notification.title}
        />
        {this.props.profile?.notification?.length > 0
          ? this.headerContent()
          : null}
        {this.headerFilterByDate()}
        {profile.notification?.length <= 0 ? (
          <EmptyScreen notifications />
        ) : (
          this.makeListCell()
        )}
        {/* {this.makeListCell()} */}
      </View>
    );
  }
}

export default Notification;

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#f2f5f8',
    flex: 1,
  },
  cellViewInFront: {
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 2,
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowColor: '#80c2c6cf',
    shadowOpacity: 0.2,
  },
  filterCell: {
    width: (SCREEN_WIDTH - 60) / 3,
    height: 40,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: 'white',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBack: {
    // backgroundColor: '#ffa6a6',
    // marginHorizontal: 8,
    // marginTop: 11,
    // width: 75,
    // borderRadius: 2,
    marginVertical: 5,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // paddingLeft: 15,
  },
  deleteIconRight: {
    backgroundColor: '#ffa6a6',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 0,
    position: 'absolute',
    top: 0,
    width: 75,
    right: 0,
  },
  dateStyles: {
    ...Specs.fontRegular,
    fontSize: 12,
    color: '#515867',
  },
  // emptyScreenView: {
  //   position: 'relative',
  //   top: 150,
  //   flex: 1,
  //   marginBottom: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  headerContentView: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    height: 100,
    backgroundColor: '#6797d4',
  },
  listContainer: {
    marginHorizontal: 10,
    marginTop: 5,
    flex: 1,
    marginBottom: 10,
  },
});
