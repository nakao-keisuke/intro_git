import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { HourlyWeather } from "../types/weather";
import { getWeatherEmoji } from "../api/weather";

interface Props {
  hourlyData: HourlyWeather[];
}

export default function HourlyChart({ hourlyData }: Props) {
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = Math.max(screenWidth - 80, hourlyData.length * 50);

  const temperatureData = hourlyData.map((h, i) => ({
    value: h.temperature,
    label: i % 3 === 0 ? `${new Date(h.time).getHours()}時` : "",
    dataPointText: i % 2 === 0 ? `${Math.round(h.temperature)}°` : "",
  }));

  const precipitationData = hourlyData.map((h, i) => ({
    value: h.precipitation,
    label: i % 3 === 0 ? `${new Date(h.time).getHours()}時` : "",
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>24時間予報</Text>

      <View style={styles.emojiRow}>
        {hourlyData.filter((_, i) => i % 3 === 0).map((h, i) => (
          <View key={i} style={styles.emojiItem}>
            <Text style={styles.emojiText}>{getWeatherEmoji(h.weatherCode)}</Text>
            <Text style={styles.emojiHour}>{new Date(h.time).getHours()}時</Text>
          </View>
        ))}
      </View>

      <Text style={styles.subtitle}>🌡️ 気温 (°C)</Text>
      <View style={styles.chartWrapper}>
        <LineChart
          data={temperatureData}
          width={chartWidth} height={140} spacing={50}
          color="#FF6B6B" thickness={2}
          curved
          hideDataPoints={false} dataPointsColor="#FF6B6B" dataPointsRadius={3}
          textColor="#555" textFontSize={10}
          xAxisLabelTextStyle={styles.xLabel} yAxisTextStyle={styles.yLabel}
          yAxisColor="#E0E0E0" xAxisColor="#E0E0E0"
          rulesType="dashed" rulesColor="#ECECEC" noOfSections={4}
          animateOnDataChange isAnimated
          showVerticalLines verticalLinesColor="#F5F5F5"
        />
      </View>

      <Text style={styles.subtitle}>💧 降水量 (mm)</Text>
      <View style={styles.chartWrapper}>
        <LineChart
          data={precipitationData}
          width={chartWidth} height={100} spacing={50}
          color="#4ECDC4" thickness={2}
          curved
          hideDataPoints={false} dataPointsColor="#4ECDC4" dataPointsRadius={3}
          xAxisLabelTextStyle={styles.xLabel} yAxisTextStyle={styles.yLabel}
          yAxisColor="#E0E0E0" xAxisColor="#E0E0E0"
          rulesType="dashed" rulesColor="#ECECEC" noOfSections={3}
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
    marginTop: 16, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 6,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#1a1a2e", marginBottom: 16 },
  subtitle: { fontSize: 14, fontWeight: "600", color: "#555", marginTop: 16, marginBottom: 8 },
  chartWrapper: { marginLeft: -10, overflow: "hidden" },
  emojiRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 8, paddingHorizontal: 4 },
  emojiItem: { alignItems: "center" },
  emojiText: { fontSize: 22 },
  emojiHour: { fontSize: 10, color: "#888", marginTop: 2 },
  xLabel: { color: "#999", fontSize: 10 },
  yLabel: { color: "#999", fontSize: 10 },
});
