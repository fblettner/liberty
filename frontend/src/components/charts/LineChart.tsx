import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useTheme } from "@emotion/react";

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

// Props for the LineChart component
interface LineChartProps {
  dataset: Record<string, any>[];
  colors?: string[];
  grid?: { horizontal: boolean; vertical: boolean };
  xAxis: { scaleType: string; data: string[]; label: string }[];
  yAxis: { id: string; label: string }[];
  series: { dataKey: string; label: string; yAxisKey?: string }[];
}

export const LineChart: React.FC<LineChartProps> = ({
  dataset,
  colors,
  grid,
  xAxis,
  yAxis,
  series,
}) => {
  const theme = useTheme();
  const textColor = theme.palette.text.primary;
  const gridLineColor = theme.palette.divider;

  const labels = xAxis[0]?.data || [];
  const datasets = series.map((serie, index) => ({
    label: serie.label,
    data: dataset.map((data) => data[serie.dataKey]),
    borderColor: colors ? colors[index % colors.length] : `hsl(${index * 50}, 70%, 50%)`,
    backgroundColor: colors
      ? colors[index % colors.length]
      : `hsl(${index * 50}, 70%, 50%)`,
    tension: 0.4, // Smooth line
    fill: false, // Disable area fill
    yAxisID: serie.yAxisKey || "default-axis",
  }));

  const chartData = {
    labels,
    datasets,
  };

  const yAxisScales = yAxis.reduce((acc, axis, index) => {
    acc[axis.id] = {
      type: "linear" as const,
      position: index % 2 === 0 ? "left" : "right",
      title: {
        display: true,
        text: axis.label,
        color: textColor,
      },
      grid: {
        display: grid?.horizontal || false,
        color: gridLineColor,
        drawOnChartArea: index % 2 === 0 ? true : false
      },
      ticks: {
        color: textColor,
      },
    };
    return acc;
  }, {} as Record<string, any>);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: textColor, // Use theme text color for legend labels
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        type: "category" as const,
        title: {
          display: true,
          text: xAxis[0]?.label || "X-Axis",
          color: textColor
        },
        grid: {
          drawOnChartArea: grid?.vertical || false, // Vertical grid lines
          color: gridLineColor
        },
        ticks: {
          color: textColor, // Use theme text color for y-axis ticks
        },
      },
      ...yAxisScales,
    },
  };

  return (

      <Line data={chartData} options={chartOptions} />

  );
};