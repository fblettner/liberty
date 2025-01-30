import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Props for the PieChart component
interface PieChartProps {
  colors?: string[];
  data: { value: number; label: string }[];
}

// Styled Wrapper for consistent layout
const ChartWrapper = styled.div({
  position: "relative",
  width: "100%",
  maxWidth: "400px", // Set a max width for the chart
  margin: "0 auto", // Center the chart
});

// Custom PieChart Component
export const PieChart: React.FC<PieChartProps> = ({ colors, data }) => {
  const theme = useTheme();
  const textColor = theme.palette.text.primary;

  // Extract labels and values from the data
  const labels = data.map((item) => item.label);
  const values = data.map((item) => item.value);

  // Define the chart data and options
  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors || [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ], // Default palette if none is provided
        hoverBackgroundColor: colors || [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const, // Position the legend at the top
        labels: {
          color: textColor, // Use theme text color for legend labels
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) =>
            `${context.label}: ${context.raw} (${(
              (context.raw / values.reduce((a, b) => a + b, 0)) *
              100
            ).toFixed(2)}%)`,
        },
      },
    },
  };

  return (
    <ChartWrapper>
      <Doughnut data={chartData} options={chartOptions} />
    </ChartWrapper>
  );
};