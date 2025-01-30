import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTheme } from "@emotion/react";
// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Props for the BarChart component
interface BarChartProps {
  dataset: Record<string, any>[];
  colors: string[];
  grid: { horizontal: boolean; vertical: boolean };
  xAxis: { scaleType: string; data: string[]; label: string }[];
  yAxis: { label: string }[];
  series: { dataKey: string; label: string }[];
}

export const BarChart = ({ dataset, colors, grid, xAxis, yAxis, series }: BarChartProps) => {
  const theme = useTheme();
  const textColor = theme.palette.text.primary;
  const gridLineColor = theme.palette.divider;

  const data = {
    labels: xAxis[0].data, // x-axis labels
    datasets: series.map((s, index) => ({
      label: s.label,
      data: dataset.map((d) => d[s.dataKey]),
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
          display: true, 
          position: "top" as const,
          labels: {
            color: textColor, // Use theme text color for legend labels
          },
      },
      tooltip: { enabled: true },

    },
    scales: {
      x: {
        grid: { display: grid.vertical, color: gridLineColor, },
        title: {
          display: !!xAxis[0].label,
          text: xAxis[0].label,
          color: textColor, // Use theme text color for x-axis title
        },
        ticks: {
          color: textColor, // Use theme text color for x-axis ticks
        },
      },
      y: {
        grid: { display: grid.horizontal, color: gridLineColor,  },
        title: {
          display: !!yAxis[0].label,
          text: yAxis[0].label,
          color: textColor, // Use theme text color for y-axis title
        },
        ticks: {
          color: textColor, // Use theme text color for y-axis ticks
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};