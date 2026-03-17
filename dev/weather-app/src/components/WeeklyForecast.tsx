import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { DailyWeather } from "../types/weather";
import { getWeatherEmoji } from "../api/weather";

interface Props {
  dailyData: DailyWeather[];
}

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function getDayName(dateStr: string): string {
  return DAY_NAMES[new Date(dateStr).getDay()];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function WeeklyForecast({ dailyData }: Props) {
  const barData = dailyData.flatMap((d) => [
    {
      value: d.tempMax, label: formatDate(d.date), spacing: 2,
      frontColor: "#FF6B6B", labelTextStyle: { color: "#999", fontSize: 10 },
    },
    { value: d.tempMin, frontColor: "#4ECDC4", spacing: 18 },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>7日間予報</Text>

      {dailyData.map((day) => {
        const dayName = getDayName(day.date);
        const isWeekend = dayName === "土" || dayName === "日";
        return (
          <View key={day.date} style={styles.dayRow}>
            <View style={styles.dayLeft}>
              <Text style={[styles.dayName, isWeekend && { color: dayName === "日" ? "#FF6B6B" : "#4A90D9" }]}>
                {dayName}
              </Text>
              <Text style={styles.dateText}>{formatDate(day.date)}</Text>
            </View>
            <Text style={styles.weatherEmoji}>{getWeatherEmoji(day.weatherCode)}</Text>
            <View style={styles.tempBar}>
              <Text style={styles.tempMin}>{Math.round(day.tempMin)}°</Text>
              <View style={styles.barContainer}>
                <View style={[styles.bar, {
                  marginLeft: `${Math.max(0, ((day.tempMin + 10) / 50) * 100)}%`,
                  width: `${Math.max(10, ((day.tempMax - day.tempMin) / 50) * 100)}%`,
                }]} />
              </View>
              <Text style={styles.tempMax}>{Math.round(day.tempMax)}°</Text>
            </View>
          </View>
        );
      })}

      <Text style={styles.subtitle}>最高/最低気温比較</Text>
      <View style={styles.chartWrapper}>
        <BarChart
          data={barData} barWidth={14} spacing={2}
          roundedTop roundedBottom
          xAxisThickness={1} yAxisThickness={0}
          xAxisColor="rgba(0,0,0,0.1)"
          yAxisTextStyle={{ color: "#999", fontSize: 10 }}
          noOfSections={4} isAnimated height={120}
        />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#FF6B6B" }]} />
          <Text style={styles.legendText}>最高気温</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#4ECDC4" }]} />
          <Text style={styles.legendText}>最低気温</Text>
        </View>
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
  subtitle: { fontSize: 14, fontWeight: "600", color: "#555", marginTop: 20, marginBottom: 12 },
  dayRow: {
    flexDirection: "row", alignItems: "center", paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.04)",
  },
  dayLeft: { width: 50 },
  dayName: { fontSize: 15, fontWeight: "600", color: "#333" },
  dateText: { fontSize: 11, color: "#999" },
  weatherEmoji: { fontSize: 24, width: 40, textAlign: "center" },
  tempBar: { flex: 1, flexDirection: "row", alignItems: "center", marginLeft: 8 },
  tempMin: { fontSize: 14, color: "#4ECDC4", fontWeight: "600", width: 35, textAlign: "right" },
  barContainer: {
    flex: 1, height: 6, backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3, marginHorizontal: 8, overflow: "hidden",
  },
  bar: { height: 6, borderRadius: 3, backgroundColor: "#FF6B6B", opacity: 0.6 },
  tempMax: { fontSize: 14, color: "#FF6B6B", fontWeight: "600", width: 35 },
  chartWrapper: { marginLeft: -10, overflow: "hidden" },
  legend: { flexDirection: "row", justifyContent: "center", marginTop: 12, gap: 20 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: "#777" },
});
