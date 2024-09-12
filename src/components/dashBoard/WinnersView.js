/**
 * @description Use to make Winners View
 */
import React, { Component } from 'react';
import {
  View, StyleSheet,
} from 'react-native';
import Winners from './Winners';
import { WinnerEnum } from '../../utility/constant/Constants';

const styles = StyleSheet.create({
  containerView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'white',
  },
});

const CAR_WINNER_IMAGE = require('../../assets/images/DashBoardHeader/carwinner.jpg');
const HOME_WINNER_IMAGE = require('../../assets/images/DashBoardHeader/homeWinner.jpg');
const TRIP_WINNER_IMAGE = require('../../assets/images/DashBoardHeader/tripWinner.jpg');

export default class WinnersView extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

    handleCarWinnerClick = () => {
      let { winnerHandler } = this.props
      winnerHandler(WinnerEnum.CarWinner);
    }
    
    handleTripWinnerClick = () => {
      let { winnerHandler } = this.props
      winnerHandler(WinnerEnum.TripWinner);
    }

    handleHomeWinnerClick = () => {
      let { winnerHandler } = this.props
      winnerHandler(WinnerEnum.HomeWinner);
    }

    render() {      
      return (
        <View style={styles.containerView}>
          <Winners winnerImg={CAR_WINNER_IMAGE} winnerClickedHandler={this.handleCarWinnerClick} />
          <Winners winnerImg={HOME_WINNER_IMAGE} winnerClickedHandler={this.handleHomeWinnerClick} />
          <Winners winnerImg={TRIP_WINNER_IMAGE} winnerClickedHandler={this.handleTripWinnerClick} />
        </View>
      );
    }
}
