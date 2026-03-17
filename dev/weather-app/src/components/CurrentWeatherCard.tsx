import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CurrentWeather } from "../types/weather";
import { getWeatherDescription, getWeatherEmoji } from "../api/weather";

interface Props {
  current: CurrentWeather;
  locationName: string;
}

export default function CurrentWeatherCard({ current, locationName }: Props) {
  return (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.location}>{locationName}</Text>
      <Text style={styles.emoji}>{getWeatherEmoji(current.weatherCode)}</Text>
      <Text style={styles.temperature}>{Math.round(current.temperature)}°</Text>
      <Text style={styles.description}>{getWeatherDescription(current.weatherCode)}</Text>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>体感温度</Text>
          <Text style={styles.detailValue}>{Math.round(current.apparentTemperature)}°</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>湿度</Text>
          <Text style={styles.detailValue}>{current.humidity}%</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>風速</Text>
          <Text style={styles.detailValue}>{current.windSpeed.toFixed(1)}m/s</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24, padding: 28, marginHorizontal: 16, marginTop: 8,
    alignItems: "center",
    shadowColor: "#667eea", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 12,
  },
  location: { fontSize: 18, fontWeight: "600", color: "rgba(255,255,255,0.9)", letterSpacing: 1 },
  emoji: { fontSize: 72, marginVertical: 8 },
  temperature: { fontSize: 72, fontWeight: "200", color: "#fff", lineHeight: 80 },
  description: { fontSize: 18, color: "rgba(255,255,255,0.85)", marginTop: 4, fontWeight: "500" },
  detailsRow: {
    flexDirection: "row", marginTop: 24, alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 20,
  },
  detailItem: { flex: 1, alignItems: "center" },
  detailLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 4 },
  detailValue: { fontSize: 16, fontWeight: "600", color: "#fff" },
  divider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.25)" },
});
