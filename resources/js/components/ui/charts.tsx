"use client"

import { useTheme } from "next-themes"
import { Line, Bar, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
  ScriptableContext,
  Plugin,
  TooltipItem,
} from "chart.js"
import { useEffect, useState } from "react"

// Extend ChartJS types to include custom plugin properties
declare module "chart.js" {
  interface PluginOptionsByType<TType> {
    centerText?: {
      primary?: string;
      secondary?: string;
    };
    themeColors?: {
      foregroundColor: string;
      mutedForegroundColor: string;
      [key: string]: string;
    };
  }
}

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Register the center text plugin only once at the module level
const centerTextPlugin = {
  id: 'centerText',
  afterDraw: (chart: any) => {
    const centerText = chart.options.plugins?.centerText;
    const themeColors = chart.options.plugins?.themeColors;

    if (!centerText || !themeColors) return;

    const ctx = chart.ctx;
    const width = chart.width;
    const height = chart.height;

    ctx.restore();
    const fontSize = (height / 114).toFixed(2);
    ctx.font = `${fontSize}em sans-serif`;
    ctx.textBaseline = "middle";

    const primaryText = centerText.primary || '';
    const secondaryText = centerText.secondary || '';

    ctx.font = `bold ${Number(fontSize) * 1.6}em sans-serif`;
    ctx.fillStyle = themeColors.foregroundColor;
    ctx.textAlign = "center";
    ctx.fillText(primaryText, width / 2, height / 2 - (secondaryText ? 15 : 0));

    if (secondaryText) {
      ctx.font = `${fontSize}em sans-serif`;
      ctx.fillStyle = themeColors.mutedForegroundColor;
      ctx.fillText(secondaryText, width / 2, height / 2 + 20);
    }

    ctx.save();
  }
};

// Register the plugin once
ChartJS.register(centerTextPlugin);

// Chart type definitions
type LineChartData = ChartData<'line', number[], string>;
type BarChartData = ChartData<'bar', number[], string>;
type PieChartData = ChartData<'pie', number[], string>;

interface ChartProps {
  series: { name: string; data: number[] }[]
  categories: string[]
  colors?: string[]
  height?: number
  yAxisWidth?: number
  showLegend?: boolean
  showYAxis?: boolean
  showXAxis?: boolean
  showYGrid?: boolean
  showXGrid?: boolean
  title?: string
  stacked?: boolean
}

interface PieChartProps {
  series: number[]
  labels: string[]
  colors?: string[]
  width?: number
  height?: number
  title?: string
  isDonut?: boolean
  centerText?: {
    primary?: string
    secondary?: string
  }
}

// Define chart theme colors based on shadcn UI
const chartColors = {
  light: {
    backgroundColor: "hsl(0 0% 100%)",
    foregroundColor: "hsl(222.2 84% 4.9%)",
    mutedColor: "hsl(210 40% 96.1%)",
    mutedForegroundColor: "hsl(215.4 16.3% 46.9%)",
    borderColor: "hsl(214.3 31.8% 91.4%)",
    gridColor: "hsl(216 34% 93%)",
    tooltipBackground: "hsl(0 0% 100% / 95%)",
    tooltipBorder: "hsl(214.3 31.8% 91.4%)",
  },
  dark: {
    backgroundColor: "hsl(222.2 84% 4.9%)",
    foregroundColor: "hsl(210 40% 98%)",
    mutedColor: "hsl(217.2 32.6% 17.5%)",
    mutedForegroundColor: "hsl(215 20.2% 65.1%)",
    borderColor: "hsl(217.2 32.6% 17.5%)",
    gridColor: "hsl(217 19% 27%)",
    tooltipBackground: "hsl(222.2 84% 8% / 95%)",
    tooltipBorder: "hsl(217.2 32.6% 17.5% / 80%)",
  }
}

// Enhanced chart colors with separate dark/light mode color schemes
const defaultChartColors = {
  light: {
    line: [
      "hsl(221.2 83.2% 53.3%)", // blue
      "hsl(262.1 83.3% 57.8%)", // purple
      "hsl(346.8 77.2% 49.8%)", // red
      "hsl(43.3 96.4% 56.3%)",  // yellow
      "hsl(172.5 68.6% 50%)"    // green
    ],
    bar: [
      "hsl(221.2 83.2% 53.3%)",
      "hsl(262.1 83.3% 57.8%)",
      "hsl(346.8 77.2% 49.8%)",
      "hsl(43.3 96.4% 56.3%)",
      "hsl(172.5 68.6% 50%)"
    ],
    area: [
      "hsl(221.2 83.2% 53.3%)",
      "hsl(262.1 83.3% 57.8%)",
      "hsl(346.8 77.2% 49.8%)",
      "hsl(43.3 96.4% 56.3%)",
      "hsl(172.5 68.6% 50%)"
    ],
    pie: [
      "hsl(221.2 83.2% 53.3%)",
      "hsl(262.1 83.3% 57.8%)",
      "hsl(346.8 77.2% 49.8%)",
      "hsl(43.3 96.4% 56.3%)",
      "hsl(172.5 68.6% 50%)"
    ],
  },
  dark: {
    line: [
      "hsl(217.2 91.2% 59.8%)",  // blue (brighter)
      "hsl(262.1 83.3% 68.2%)",  // purple (brighter)
      "hsl(346.8 77.2% 58.4%)",  // red (brighter)
      "hsl(47.9 95.8% 53.1%)",   // yellow (adjusted for dark mode)
      "hsl(159.6 83.5% 47.3%)"   // green (brighter)
    ],
    bar: [
      "hsl(217.2 91.2% 59.8%)",
      "hsl(262.1 83.3% 68.2%)",
      "hsl(346.8 77.2% 58.4%)",
      "hsl(47.9 95.8% 53.1%)",
      "hsl(159.6 83.5% 47.3%)"
    ],
    area: [
      "hsl(217.2 91.2% 59.8%)",
      "hsl(262.1 83.3% 68.2%)",
      "hsl(346.8 77.2% 58.4%)",
      "hsl(47.9 95.8% 53.1%)",
      "hsl(159.6 83.5% 47.3%)"
    ],
    pie: [
      "hsl(217.2 91.2% 59.8%)",
      "hsl(262.1 83.3% 68.2%)",
      "hsl(346.8 77.2% 58.4%)",
      "hsl(47.9 95.8% 53.1%)",
      "hsl(159.6 83.5% 47.3%)"
    ],
  }
}

export function LineChart({
  series,
  categories,
  colors,
  height = 400,
  yAxisWidth = 40,
  showLegend = true,
  showYAxis = true,
  showXAxis = true,
  showYGrid = true,
  showXGrid = true,
  title,
}: ChartProps) {
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"
  const themeColors = isDark ? chartColors.dark : chartColors.light
  const themeChartColors = colors || (isDark
    ? defaultChartColors.dark.line
    : defaultChartColors.light.line)
  const [chartData, setChartData] = useState<LineChartData>({
    labels: [],
    datasets: []
  })
  const [chartOptions, setChartOptions] = useState<ChartOptions<'line'>>({})
  const [themeState, setThemeState] = useState(isDark)

  // Update chart when theme changes
  useEffect(() => {
    if (themeState !== isDark) {
      setThemeState(isDark)
    }
  }, [isDark, themeState])

  useEffect(() => {
    setChartData({
      labels: categories,
      datasets: series.map((item, i) => ({
        label: item.name,
        data: item.data,
        borderColor: themeChartColors[i % themeChartColors.length],
        backgroundColor: themeChartColors[i % themeChartColors.length],
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.2,
      })),
    })

    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      color: themeColors.foregroundColor,
      scales: {
        y: {
          display: showYAxis,
          grid: {
            display: showYGrid,
            color: themeColors.gridColor,
          },
          border: {
            display: false,
            color: themeColors.borderColor,
            dash: [4, 4],
          },
          ticks: {
            color: themeColors.mutedForegroundColor,
            font: {
              size: 11,
              weight: 400,
            },
            padding: 8,
          },
          title: {
            display: false,
            color: themeColors.foregroundColor,
          }
        },
        x: {
          display: showXAxis,
          grid: {
            display: showXGrid,
            color: themeColors.gridColor,
          },
          border: {
            display: false,
            color: themeColors.borderColor,
            dash: [0, 0],
          },
          ticks: {
            color: themeColors.mutedForegroundColor,
            font: {
              size: 10,
              weight: 400,
            },
            padding: 8,
          },
          title: {
            display: false,
            color: themeColors.foregroundColor,
          }
        },
      },
      plugins: {
        legend: {
          display: showLegend,
          position: "top" as const,
          align: "start" as const,
          labels: {
            color: themeColors.foregroundColor,
            font: {
              size: 12,
              weight: 500,
            },
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20,
            boxWidth: 8,
            boxHeight: 8,
          },
        },
        tooltip: {
          backgroundColor: themeColors.tooltipBackground,
          titleColor: themeColors.foregroundColor,
          bodyColor: themeColors.foregroundColor,
          titleFont: {
            weight: 'bold',
            size: 13,
          },
          bodyFont: {
            size: 12,
          },
          borderColor: themeColors.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            labelColor: function(tooltipItem: TooltipItem<'line'>) {
              return {
                borderColor: 'transparent',
                backgroundColor: tooltipItem.dataset.borderColor as string || themeChartColors[0],
              };
            }
          }
        },
        title: {
          display: !!title,
          text: title || '',
          color: themeColors.foregroundColor,
          font: {
            size: 16,
            weight: 500,
          },
          padding: { top: 0, bottom: 24 }
        },
      },
    })
  }, [categories, series, themeChartColors, isDark, themeState, showLegend, showYAxis, showXAxis, showYGrid, showXGrid, title, themeColors])

  return (
    <div style={{ height, width: "100%" }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  )
}

export function BarChart({
  series,
  categories,
  colors,
  height = 400,
  yAxisWidth = 40,
  showLegend = true,
  showYAxis = true,
  showXAxis = true,
  showYGrid = true,
  showXGrid = true,
  title,
  stacked = false,
}: ChartProps) {
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"
  const themeColors = isDark ? chartColors.dark : chartColors.light
  const themeChartColors = colors || (isDark
    ? defaultChartColors.dark.bar
    : defaultChartColors.light.bar)
  const [chartData, setChartData] = useState<BarChartData>({
    labels: [],
    datasets: []
  })
  const [chartOptions, setChartOptions] = useState<ChartOptions<'bar'>>({})
  const [themeState, setThemeState] = useState(isDark)

  // Update chart when theme changes
  useEffect(() => {
    if (themeState !== isDark) {
      setThemeState(isDark)
    }
  }, [isDark, themeState])

  useEffect(() => {
    setChartData({
      labels: categories,
      datasets: series.map((item, i) => ({
        label: item.name,
        data: item.data,
        backgroundColor: themeChartColors[i % themeChartColors.length],
        borderWidth: 0,
        borderRadius: stacked ? 0 : 4,
        hoverBackgroundColor: themeChartColors[i % themeChartColors.length],
        hoverBorderWidth: 2,
        hoverBorderColor: isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)",
      })),
    })

    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      color: themeColors.foregroundColor,
      scales: {
        y: {
          display: showYAxis,
          stacked: stacked,
          grid: {
            display: showYGrid,
            color: themeColors.gridColor,
          },
          border: {
            display: false,
            color: themeColors.borderColor,
            dash: [4, 4],
          },
          ticks: {
            color: themeColors.mutedForegroundColor,
            font: {
              size: 11,
              weight: 400,
            },
            padding: 8,
          },
          title: {
            display: false,
            color: themeColors.foregroundColor,
          }
        },
        x: {
          display: showXAxis,
          stacked: stacked,
          grid: {
            display: showXGrid,
            color: themeColors.gridColor,
          },
          border: {
            display: false,
            color: themeColors.borderColor,
            dash: [0, 0],
          },
          ticks: {
            color: themeColors.mutedForegroundColor,
            font: {
              size: 10,
              weight: 400,
            },
            padding: 8,
          },
          title: {
            display: false,
            color: themeColors.foregroundColor,
          }
        },
      },
      plugins: {
        legend: {
          display: showLegend,
          position: "top" as const,
          align: "start" as const,
          labels: {
            color: themeColors.foregroundColor,
            font: {
              size: 12,
              weight: 500,
            },
            usePointStyle: true,
            pointStyle: 'rect',
            padding: 20,
            boxWidth: 8,
            boxHeight: 8,
          },
        },
        tooltip: {
          backgroundColor: themeColors.tooltipBackground,
          titleColor: themeColors.foregroundColor,
          bodyColor: themeColors.foregroundColor,
          titleFont: {
            weight: 'bold',
            size: 13,
          },
          bodyFont: {
            size: 12,
          },
          borderColor: themeColors.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            labelColor: function(tooltipItem: TooltipItem<'bar'>) {
              const backgroundColor = tooltipItem.dataset.backgroundColor;
              return {
                borderColor: 'transparent',
                backgroundColor: Array.isArray(backgroundColor)
                  ? backgroundColor[tooltipItem.dataIndex] || themeChartColors[0]
                  : backgroundColor as string || themeChartColors[0],
              };
            }
          }
        },
        title: {
          display: !!title,
          text: title || '',
          color: themeColors.foregroundColor,
          font: {
            size: 16,
            weight: 500,
          },
          padding: { top: 0, bottom: 24 }
        },
      },
    })
  }, [categories, series, themeChartColors, isDark, themeState, showLegend, showYAxis, showXAxis, showYGrid, showXGrid, title, themeColors, stacked])

  return (
    <div style={{ height, width: "100%" }}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  )
}

export function AreaChart({
  series,
  categories,
  colors,
  height = 400,
  yAxisWidth = 40,
  showLegend = true,
  showYAxis = true,
  showXAxis = true,
  showYGrid = true,
  showXGrid = true,
  title,
  stacked = false,
}: ChartProps) {
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"
  const themeColors = isDark ? chartColors.dark : chartColors.light
  const themeChartColors = colors || (isDark
    ? defaultChartColors.dark.area
    : defaultChartColors.light.area)
  const [chartData, setChartData] = useState<LineChartData>({
    labels: [],
    datasets: []
  })
  const [chartOptions, setChartOptions] = useState<ChartOptions<'line'>>({})
  const [themeState, setThemeState] = useState(isDark)

  // Update chart when theme changes
  useEffect(() => {
    if (themeState !== isDark) {
      setThemeState(isDark)
    }
  }, [isDark, themeState])

  useEffect(() => {
    setChartData({
      labels: categories,
      datasets: series.map((item, i) => ({
        label: item.name,
        data: item.data,
        borderColor: themeChartColors[i % themeChartColors.length],
        backgroundColor: `${themeChartColors[i % themeChartColors.length]}${stacked ? '80' : '25'}`,  // More opaque if stacked
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: themeChartColors[i % themeChartColors.length],
        pointBorderColor: isDark ? themeColors.backgroundColor : themeColors.backgroundColor,
        pointBorderWidth: 1.5,
        tension: 0.4,
        fill: true,
      })),
    })

    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      color: themeColors.foregroundColor,
      scales: {
        y: {
          display: showYAxis,
          stacked: stacked,
          beginAtZero: true,
          grid: {
            display: showYGrid,
            color: themeColors.gridColor,
          },
          border: {
            display: false,
            color: themeColors.borderColor,
            dash: [4, 4],
          },
          ticks: {
            color: themeColors.mutedForegroundColor,
            font: {
              size: 11,
              weight: 400,
            },
            padding: 8,
          },
          title: {
            display: false,
            color: themeColors.foregroundColor,
          }
        },
        x: {
          display: showXAxis,
          stacked: stacked,
          grid: {
            display: showXGrid,
            color: themeColors.gridColor,
          },
          border: {
            display: false,
            color: themeColors.borderColor,
            dash: [0, 0],
          },
          ticks: {
            color: themeColors.mutedForegroundColor,
            font: {
              size: 10,
              weight: 400,
            },
            padding: 8,
          },
          title: {
            display: false,
            color: themeColors.foregroundColor,
          }
        },
      },
      plugins: {
        legend: {
          display: showLegend,
          position: "top" as const,
          align: "start" as const,
          labels: {
            color: themeColors.foregroundColor,
            font: {
              size: 12,
              weight: 500,
            },
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20,
            boxWidth: 8,
            boxHeight: 8,
          },
        },
        tooltip: {
          backgroundColor: themeColors.tooltipBackground,
          titleColor: themeColors.foregroundColor,
          bodyColor: themeColors.foregroundColor,
          titleFont: {
            weight: 'bold',
            size: 13,
          },
          bodyFont: {
            size: 12,
          },
          borderColor: themeColors.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            labelColor: function(tooltipItem: TooltipItem<'line'>) {
              return {
                borderColor: 'transparent',
                backgroundColor: tooltipItem.dataset.borderColor as string || themeChartColors[0],
              };
            }
          }
        },
        title: {
          display: !!title,
          text: title || '',
          color: themeColors.foregroundColor,
          font: {
            size: 16,
            weight: 500,
          },
          padding: { top: 0, bottom: 24 }
        },
      },
    })
  }, [categories, series, themeChartColors, isDark, themeState, showLegend, showYAxis, showXAxis, showYGrid, showXGrid, title, themeColors, stacked])

  return (
    <div style={{ height, width: "100%" }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  )
}

export function PieChart({
  series,
  labels,
  colors,
  width = 400,
  height = 400,
  title,
  isDonut = false,
  centerText,
}: PieChartProps) {
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"
  const themeColors = isDark ? chartColors.dark : chartColors.light
  const themeChartColors = colors || (isDark
    ? defaultChartColors.dark.pie
    : defaultChartColors.light.pie)
  const [chartData, setChartData] = useState<PieChartData>({
    labels: [],
    datasets: []
  })
  const [chartOptions, setChartOptions] = useState<ChartOptions<'pie'>>({})
  const [themeState, setThemeState] = useState(isDark)

  // Update chart when theme changes
  useEffect(() => {
    if (themeState !== isDark) {
      setThemeState(isDark)
    }
  }, [isDark, themeState])

  useEffect(() => {
    const hoverColors = themeChartColors.map(color => `${color}dd`);

    setChartData({
      labels: labels,
      datasets: [
        {
          data: series,
          backgroundColor: themeChartColors,
          hoverBackgroundColor: hoverColors,
          borderColor: themeColors.backgroundColor,
          borderWidth: 2,
          hoverBorderWidth: 4,
          hoverBorderColor: themeColors.backgroundColor,
        },
      ],
    })

    const baseOptions: ChartOptions<'pie'> = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: isDonut ? '70%' : '40%',
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            padding: 24,
            color: themeColors.foregroundColor,
            font: {
              size: 12,
              weight: 500,
            },
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            boxHeight: 8,
          },
        },
        tooltip: {
          backgroundColor: themeColors.tooltipBackground,
          titleColor: themeColors.foregroundColor,
          bodyColor: themeColors.foregroundColor,
          titleFont: {
            weight: 'bold',
            size: 13,
          },
          bodyFont: {
            size: 12,
          },
          borderColor: themeColors.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          cornerRadius: 6,
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            },
            labelColor: function(tooltipItem: TooltipItem<'pie'>) {
              const bgColors = tooltipItem.dataset.backgroundColor;
              return {
                borderColor: 'transparent',
                backgroundColor: Array.isArray(bgColors)
                  ? bgColors[tooltipItem.dataIndex] || themeChartColors[tooltipItem.dataIndex % themeChartColors.length]
                  : (bgColors as string) || themeChartColors[0],
              };
            }
          }
        },
        title: {
          display: !!title,
          text: title || '',
          color: themeColors.foregroundColor,
          font: {
            size: 16,
            weight: 500,
          },
          padding: { top: 0, bottom: 24 }
        },
        centerText: isDonut && centerText ? centerText : undefined,
        themeColors: isDonut && centerText ? themeColors : undefined
      }
    };

    setChartOptions(baseOptions);
  }, [series, labels, themeChartColors, isDark, themeState, title, themeColors, isDonut, centerText]);

  return (
    <div style={{ width, height }}>
      <Pie data={chartData} options={chartOptions} />
    </div>
  )
}

// Add a new export for a Donut Chart component (for convenience)
export function DonutChart(props: PieChartProps) {
  return <PieChart {...props} isDonut={true} />;
}
