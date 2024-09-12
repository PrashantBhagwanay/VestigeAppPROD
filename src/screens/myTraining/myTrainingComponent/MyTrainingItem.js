/**
 * @description Use to make My training cell
 */
import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { Icon } from 'react-native-elements';
import getTrainingBudgetsPopUpView from 'app/src/screens/myTraining/myTrainingComponent/TrainingBudgetsPopUp';
import { strings } from 'app/src/utility/localization/Localized';

/**
 * @description It contains the complete my training design
 */
export default class MyTrainingItem extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      showModal: false,
      showAll: false,
    };
  }

  viewDetailHandler = item => {
    this.setState({
      showModal: true,
    });
  };

  getDataView = (title, value) => {
    return (
      <View style={[styles.itemView]}>
        <View style={styles.titleView}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.ValueText}>{value}</Text>
        </View>
      </View>
    );
  };

  showExpendableData = (showAll, title, value) => {
    if (showAll) {
      return this.getDataView(title, value);
    }
  };
  showViewForBudgetDetail = showAll => {
    if (showAll) {
      const { item } = this.props;
      return (
        <TouchableOpacity
          style={styles.budgetDetailView}
          onPress={() => this.viewDetailHandler(item)}>
          <Text style={styles.budgetDetailText}>
            {strings.myTrainingScreen.budgetDetails}
          </Text>
        </TouchableOpacity>
      );
    }
  };
  editTrainingButtonPressed = item => {
    this.setState({
      showModal: false,
    });
    this.props.navigation.navigate('training', { data: item });
  };

  handleArrowIcon = showDescription => {
    if (!showDescription) {
      this.setState({
        showAll: true,
      });
    } else {
      this.setState({
        showAll: false,
      });
    }
  };

  showArrowIcon = showDescription => {
    if (showDescription) {
      return (
        <Icon name="arrow-up" type="simple-line-icon" color="black" size={16} />
      );
    }
    return (
      <Icon name="arrow-down" type="simple-line-icon" color="black" size={16} />
    );
  };

  render() {
    const { showModal, showAll } = this.state;
    const { item, isMain } = this.props;
    let tainingNameType = '';
    let trainingDate = '';
    let time = '';
    let venue = 'NA';
    let cityName = '';
    let stateName = '';
    let countryName = '';
    let traineeName = '';

    if (item && item.trainingTypeName != null) {
      tainingNameType = item.trainingTypeName;
    }
    if (item && item.trainingDate != null) {
      trainingDate = item.trainingDate;
    } else if (item && item.eventDate != null) {
      trainingDate = item.eventDate;
    }
    if (item && item.startTime != null && item.endTime != null) {
      time = item.startTime + ' To ' + item.endTime;
    } else if (item && item.startTime != null) {
      time = item.startTime;
    } else if (item && item.eventTime != null) {
      time = item.eventTime;
    }
    if (item && item.venue != null) {
      venue = item.venue;
    } else if (item && item.eventVenue != null) {
      venue = item.eventVenue;
    }
    if (item && item.traineeName != null) {
      traineeName = item.traineeName;
    }

    if (item && item.cityName != null) {
      cityName = item.cityName;
    }
    if (item && item.stateName != null) {
      stateName = item.stateName;
    }
    if (item && item.countryName != null) {
      countryName = item.countryName;
    }
    return (
      <View style={styles.mainView}>
        <View style={styles.cellView}>
          {tainingNameType?.length > 0
            ? this.getDataView('Training Type', tainingNameType)
            : null}
          {venue?.length > 0 ? this.getDataView('Venue', venue) : null}
          {trainingDate?.length > 0
            ? this.getDataView('Date', trainingDate)
            : null}
          {traineeName?.length > 0
            ? this.getDataView('Leader', traineeName)
            : null}
          {time?.length > 0
            ? this.showExpendableData(showAll, 'Time', time)
            : null}
          {cityName?.length > 0
            ? this.showExpendableData(showAll, 'City', cityName)
            : null}
          {stateName?.length > 0
            ? this.showExpendableData(showAll, 'State', stateName)
            : null}
          {countryName?.length > 0
            ? this.showExpendableData(showAll, 'Country', countryName)
            : null}
          {isMain ? this.showViewForBudgetDetail(showAll) : null}
        </View>
        <TouchableOpacity
          onPress={() => {
            this.handleArrowIcon(showAll);
          }}
          style={styles.accordionArrow}>
          {this.showArrowIcon(showAll)}
        </TouchableOpacity>
        {showModal ? getTrainingBudgetsPopUpView(this) : null}
      </View>
    );
  }
}
/**
 * @description: This is the custom stylesheet for my training cell
 */
const styles = StyleSheet.create({
  mainView: {
    width: '100%',
    marginBottom: 10,
  },
  cellView: {
    zIndex: -1,
    backgroundColor: '#ffffff',
    paddingBottom: 30,
    paddingTop: 2,
    paddingLeft: 8,
    paddingRight: 6,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    borderRadius: 2,
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowColor: '#80c2c6cf',
    shadowOpacity: 0.2,
  },
  itemView: {
    width: '100%',
  },
  titleView: {
    paddingTop: 7,
    paddingLeft: 16,
    marginBottom: 6,
  },
  titleText: {
    color: '#3f4967',
    ...Specs.fontRegular,
    fontSize: 12,
    marginBottom: 4,
  },
  ValueText: {
    color: '#373e73',
    ...Specs.fontMedium,
    fontSize: 16,
  },
  accordionArrow: {
    elevation: 3,
    flexDirection: 'row',
    shadowOffset: { width: 2, height: 4 },
    shadowColor: '#806464',
    shadowOpacity: 0.2,
    zIndex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#fff',
    width: 30,
    height: 30,
    borderRadius: 30,
  },
  budgetDetailView: {
    zIndex: 1,
    position: 'absolute',
    bottom: 15,
    height: 30,
    marginRight: 0,
    width: '100%',
  },
  budgetDetailText: {
    alignSelf: 'flex-end',
    color: '#515867',
    ...Specs.fontRegular,
    fontSize: 12,
    marginRight: 10,
    textDecorationLine: 'underline',
  },
});
