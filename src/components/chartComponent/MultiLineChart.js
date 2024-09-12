import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { color } from 'react-native-reanimated';
import { COLOR_CODES } from '../../utility/Theme';

const MultiLineChart = props => {
  const { chartHeight, chartData, bottomAxisDatatoShow } = props;
  const customData = {
    labels: bottomAxisDatatoShow,
    datasets: [
      {
        data: chartData,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View>
      <LineChart
        data={customData}
        //   formatYLabel={(value)=>`Rs${value}`}
        width={Dimensions.get('window').width - 16}
        height={chartHeight}
        chartConfig={{
          backgroundColor: COLOR_CODES.white,
          backgroundGradientFrom: COLOR_CODES.white,
          backgroundGradientTo: COLOR_CODES.white,
          decimalPlaces: 0,
          color: (opacity = 1) => COLOR_CODES.defaultBlue,
          labelColor: (opacity = 1) => COLOR_CODES.darkBlueText,
        }}
        formatYLabel={(value, index) => value}
        withVerticalLines={false}
        segments={6}
        bezier
      />
    </View>
  );
};

export default MultiLineChart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 10,
  },
  header: {
    textAlign: 'center',
    fontSize: 18,
    padding: 16,
    marginTop: 16,
  },
});
