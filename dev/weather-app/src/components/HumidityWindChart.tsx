import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { HourlyWeather } from "../types/weather";

interface Props {
  hourlyData: HourlyWeather[];
}

export default function HumidityWindChart({ hourlyData }: Props) {
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = Math.max(screenWidth - 80, hourlyData.length * 50);

  const humidityData = hourlyData.map((h, i) => ({
    value: h.humidity,
    label: i % 3 === 0 ? `${new Date(h.time).getHours()}時` : "",
  }));

  const windData = hourlyData.map((h, i) => ({
    value: h.windSpeed,
    label: i % 3 === 0 ? `${new Date(h.time).getHours()}時` : "",
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>湿度 & 風速</Text>

      <Text style={styles.subtitle}>💧 湿度 (%)</Text>
      <View style={styles.chartWrapper}>
        <LineChart
          data={humidityData}
          width={chartWidth} height={120} spacing={50}
          color="#A78BFA" thickness={2}
          curved
          hideDataPoints={false} dataPointsColor="#A78BFA" dataPointsRadius={3}
          xAxisLabelTextStyle={styles.xLabel} yAxisTextStyle={styles.yLabel}
          yAxisColor="#E0E0E0" xAxisColor="#E0E0E0"
          rulesType="dashed" rulesColor="#ECECEC" noOfSections={4} maxValue={100}
          isAnimated
          showVerticalLines verticalLinesColor="#F5F5F5"
        />
      </View>

      <Text style={styles.subtitle}>🌬️ 風速 (m/s)</Text>
      <View style={styles.chartWrapper}>
        <LineChart
          data={windData}
          width={chartWidth} height={120} spacing={50}
          color="#F59E0B" thickness={2}
          curved
          hideDataPoints={false} dataPointsColor="#F59E0B" dataPointsRadius={3}
          xAxisLabelTextStyle={styles.xLabel} yAxisTextStyle={styles.yLabel}
          yAxisColor="#E0E0E0" xAxisColor="#E0E0E0"
          rulesType="dashed" rulesColor="#ECECEC" noOfSections={4}
          isAnimated
          showVerticalLines verticalLinesColor="#F5F5F5"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff", borderRadius: 20, marginHorizontal: 16,
    marginTop: 16, marginBottom: 32, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 6,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#1a1a2e", marginBottom: 8 },
  subtitle: { fontSize: 14, fontWeight: "600", color: "#555", marginTop: 12, marginBottom: 8 },
  chartWrapper: { marginLeft: -10, overflow: "hidden" },
  xLabel: { color: "#999", fontSize: 10 },
  yLabel: { color: "#999", fontSize: 10 },
});
