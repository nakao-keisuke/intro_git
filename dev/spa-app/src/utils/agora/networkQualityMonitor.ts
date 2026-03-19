type QualitySample = {
  uplinkQuality: number;
  downlinkQuality: number;
};

const MAX_SAMPLES = 30; // 2秒間隔 × 30 = 60秒分

export class NetworkQualityMonitor {
  private samples: QualitySample[] = [];

  addSample(uplinkQuality: number, downlinkQuality: number) {
    this.samples.push({ uplinkQuality, downlinkQuality });
    if (this.samples.length > MAX_SAMPLES) {
      this.samples.shift();
    }
  }

  getSummary() {
    if (this.samples.length === 0) return undefined;
    const uplinks = this.samples.map((s) => s.uplinkQuality);
    const downlinks = this.samples.map((s) => s.downlinkQuality);
    return {
      avg_uplink_quality: round(avg(uplinks)),
      avg_downlink_quality: round(avg(downlinks)),
      min_downlink_quality: Math.min(...downlinks),
      poor_quality_count: downlinks.filter((q) => q >= 4).length,
      sample_count: this.samples.length,
    };
  }

  reset() {
    this.samples = [];
  }
}

const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
const round = (n: number) => Math.round(n * 100) / 100;
