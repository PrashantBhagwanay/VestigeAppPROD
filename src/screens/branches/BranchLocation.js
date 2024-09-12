import React, { Component } from 'react';
import { Text, View, StyleSheet, Dimensions, TouchableOpacity, Linking, Platform } from 'react-native';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Specs } from 'app/src/utility/Theme';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { strings } from 'app/src/utility/localization/Localized';
import { Header } from '../../components';


const MARKER_IMAGE = require('app/src/assets/images/Branches/pinLocation.png');
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const LATITUDE = 28.460100;
const LONGITUDE = 77.026352;
const LATITUDE_DELTA = 0.5;
const LONGITUDE_DELTA = 0.5* (screenWidth / screenHeight);

export default class BranchLocation extends React.PureComponent {
    
  constructor(props) {
    super(props);
    this.state = {
      branchLatitude: LATITUDE,
      branchLongitude: LONGITUDE,
      branchName: ''
    }
  }
    
  componentDidMount() {
    const { branchCoordinate, branchName } = this.props.route.params;
    this.setState({ branchLatitude: branchCoordinate.latitude, branchLongitude: branchCoordinate.longitude, branchName: branchName});
  }

  getMapRegion = () => ({
    latitude: this.state.branchLatitude,
    longitude: this.state.branchLongitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
  });

  openGoogleMaps = () => {
    const { branchLatitude, branchLongitude, branchName } = this.state
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${branchLatitude},${branchLongitude}`;
    const label = `${branchName}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.openURL(url); 
  }

  renderMap() {
    const { branchLatitude, branchLongitude, branchName } = this.state
    return (
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showUserLocation
        followUserLocation
        loadingEnabled
        region={this.getMapRegion()}
      >
        <Marker.Animated
          image={MARKER_IMAGE}
          coordinate={{
            latitude: parseFloat(branchLatitude),
            longitude: parseFloat(branchLongitude),
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          }}
          title={branchName}
        />
      </MapView>
    )
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.branchesScreen.branchLocation}
        />
        {this.renderMap()}
        <TouchableOpacity
          onPress={() => this.openGoogleMaps()}
          style={{ position: 'absolute', bottom: 40, right: 30 }}>
          <MaterialCommunityIcons name='directions' size={40} color='#808080' />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject
  }
});