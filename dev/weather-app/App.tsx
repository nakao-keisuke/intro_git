import React, { useEffect, useState } from "react";
import {
  StyleSheet, ScrollView, View, Text, RefreshControl,
  ActivityIndicator, SafeAreaView, Platform, StatusBar,
} from "react-native";
import { TamaguiProvider, Theme } from "@tamagui/core";
import tamaguiConfig from "./src/tamagui.config";
import { fetchWeather } from "./src/api/weather";
import { WeatherData } from "./src/types/weather";
import CurrentWeatherCard from "./src/components/CurrentWeatherCard";
import HourlyChart from "./src/components/HourlyChart";
import WeeklyForecast from "./src/components/WeeklyForecast";
import HumidityWindChart from "./src/components/HumidityWindChart";

export default function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async () => {
    try {
      setError(null);
      const data = await fetchWeather();
      setWeather(data);
    } catch (err) {
      setError("天気データの取得に失敗しました");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadWeather(); }, []);

  const onRefresh = () => { setRefreshing(true); loadWeather(); };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>天気データを取得中...</Text>
      </View>
    );
  }

  if (error || !weather) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{error || "エラーが発生しました"}</Text>
        <Text style={styles.retryText} onPress={loadWeather}>タップして再試行</Text>
      </View>
    );
  }

  const now = new Date();
  const timeString = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")} 更新`;

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <Theme name="light">
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Weather</Text>
              <Text style={styles.headerTime}>{timeString}</Text>
            </View>
            <CurrentWeatherCard current={weather.current} locationName={weather.locationName} />
            <HourlyChart hourlyData={weather.hourly} />
            <WeeklyForecast dailyData={weather.daily} />
            <HumidityWindChart hourlyData={weather.hourly} />
          </ScrollView>
        </SafeAreaView>
      </Theme>
    </TamaguiProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f4f8", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  scrollView: { flex: 1 },
  contentContainer: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#1a1a2e", letterSpacing: -0.5 },
  headerTime: { fontSize: 12, color: "#999" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f4f8" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#667eea", fontWeight: "500" },
  errorEmoji: { fontSize: 48, marginBottom: 16 },
  errorText: { fontSize: 16, color: "#e74c3c", fontWeight: "500" },
  retryText: { marginTop: 16, fontSize: 14, color: "#667eea", fontWeight: "600", textDecorationLine: "underline" },
});
