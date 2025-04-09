import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, BarChart, LineChart, PieChart } from "@/components/ui/charts";
import {
    CalendarRange,
    CircleUser,
    Package,
    ShoppingCart,
    Tags,
    TrendingUp,
    Users,
    ListFilter,
    PercentCircle,
    Check,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Debug log to check the current theme
    useEffect(() => {
        console.log("Current theme:", theme);
    }, [theme]);

    // After mounting, we can access the theme
    useEffect(() => {
        setMounted(true);
    }, []);

    // Function to get theme-aware colors
    const getThemeColors = (lightModeColors: string[], darkModeColors: string[]) => {
        return theme === 'dark' ? darkModeColors : lightModeColors;
    };

    // Function to get theme-aware text and background styles
    const getThemeStyles = () => {
        return {
            pageBackground: "dark:bg-black bg-white",
            cardBackground: "bg-sky-500/35",
            headerColor: "text-gray-700 dark:text-gray-400",
            textColor: "text-gray-900 dark:text-gray-200",

            // canvas color text

        };
    };

    const themeStyles = getThemeStyles();

    // Sample data for users chart
    const userChartData = {
        series: [
            {
                name: 'Active Users',
                data: [50, 65, 80, 95, 85, 105, 115, 130, 125, 140, 155, 170],
            },
        ],
        categories: [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ],
    };

    // Sample data for products by category
    const productCategoryData = {
        series: [
            {
                name: 'Products',
                data: [18, 12, 24, 15, 9, 8],
            },
        ],
        categories: ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty'],
    };

    // Sample data for sales trend
    const salesTrendData = {
        series: [
            {
                name: 'Revenue',
                data: [
                    2300, 2900, 3100, 2800, 3500, 4100, 3900, 4500, 4300, 4800, 5200, 5500
                ],
            },
        ],
        categories: [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ],
    };

    // Sample data for multi-series chart (adding this to showcase more colors)
    const multiSeriesData = {
        series: [
            {
                name: 'Sales 2022',
                data: [44, 55, 57, 56, 61, 58, 63, 60, 66, 68, 78, 74],
            },
            {
                name: 'Sales 2023',
                data: [76, 85, 101, 98, 87, 105, 91, 114, 94, 110, 120, 112],
            },
        ],
        categories: [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ],
    };

    // Sample data for user roles distribution
    const userRolesData = {
        series: [42, 21, 15, 7, 10],
        labels: ['Regular Users', 'Admin', 'Moderator', 'Guest', 'Staff'],
    };

    const statCards = [
        {
            title: 'Total Users',
            value: '1,248',
            change: '+12%',
            trend: 'up',
            icon: <Users className="size-4 text-foreground/50" />,
            description: 'vs. previous month',
        },
        {
            title: 'Products',
            value: '86',
            change: '+4%',
            trend: 'up',
            icon: <Package className="size-4 text-foreground/50" />,
            description: '12 added this month',
        },
        {
            title: 'Categories',
            value: '6',
            change: 'No change',
            trend: 'neutral',
            icon: <Tags className="size-4 text-foreground/50" />,
            description: 'All categories active',
        },
        {
            title: 'Sales',
            value: '$12,428',
            change: '+18%',
            trend: 'up',
            icon: <ShoppingCart className="size-4 text-foreground/50" />,
            description: 'Revenue this month',
        },
    ];

    // Only render charts after component has mounted to ensure theme is detected correctly
    if (!mounted) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-4 p-4">
                    <div className="animate-pulse flex space-x-4 justify-center items-center h-64">
                        <div className="text-center">
                            <div className="rounded-full h-10 w-10 bg-muted mx-auto mb-2"></div>
                            <div className="h-4 w-32 bg-muted rounded"></div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Add data attributes to help with dark mode detection
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div
                className={`flex h-full flex-1 flex-col gap-4 p-4 rounded-md ${themeStyles.pageBackground} ${themeStyles.textColor}`}
                data-theme={theme}
            >
                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {statCards.map((stat, index) => (
                        <Card key={index} className={themeStyles.cardBackground}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className={`text-sm font-medium ${themeStyles.headerColor}`}>
                                    {stat.title}
                                </CardTitle>
                                {stat.icon}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    <span className={`inline-flex items-center ${
                                        stat.trend === 'up'
                                            ? 'text-green-500 dark:text-green-400'
                                            : stat.trend === 'down'
                                            ? 'text-red-500 dark:text-red-400'
                                            : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                        {stat.trend === 'up' && <TrendingUp className="mr-1 size-3" />}
                                        {stat.trend === 'down' && <TrendingUp className="mr-1 size-3 rotate-180" />}
                                        {stat.trend === 'neutral' && <Check className="mr-1 size-3" />}
                                        {stat.change}
                                    </span>
                                    {' '}{stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Line Chart - User Growth */}
                    <Card className={themeStyles.cardBackground}>
                        <CardHeader>
                            <CardTitle className={themeStyles.headerColor}>User Growth</CardTitle>
                            <CardDescription>Monthly active users over the past year</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LineChart
                                height={350}
                                series={userChartData.series}
                                categories={userChartData.categories}
                                colors={getThemeColors(
                                    ["#4A90E2"], // Light mode color
                                    ["#1E88E5"]  // Dark mode color
                                )}
                                yAxisWidth={40}
                                showXGrid={false}
                                showYGrid={true}
                            />
                        </CardContent>
                    </Card>

                    {/* Area Chart - Sales Trend */}
                    <Card className={themeStyles.cardBackground}>
                        <CardHeader>
                            <CardTitle className={themeStyles.headerColor}>Revenue Trend</CardTitle>
                            <CardDescription>Monthly revenue in USD</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AreaChart
                                height={350}
                                series={salesTrendData.series}
                                categories={salesTrendData.categories}
                                colors={getThemeColors(
                                    ["#34A853"], // Light mode color
                                    ["#43A047"]  // Dark mode color
                                )}
                                yAxisWidth={60}
                                showXGrid={false}
                                showYGrid={true}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Bar Chart - Products by Category */}
                    <Card className={themeStyles.cardBackground}>
                        <CardHeader>
                            <CardTitle className={themeStyles.headerColor}>Products by Category</CardTitle>
                            <CardDescription>Number of products in each category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BarChart
                                height={350}
                                series={productCategoryData.series}
                                categories={productCategoryData.categories}
                                colors={getThemeColors(
                                    ["oklch(62.3% 0.214 259.815)"], // Light mode color
                                    ["oklch(62.3% 0.214 259.815)"]  // Dark mode color
                                )}
                                yAxisWidth={30}
                                showXGrid={false}
                                showYGrid={true}
                            />
                        </CardContent>
                    </Card>

                    {/* Pie Chart - User Roles */}
                    <Card className={themeStyles.cardBackground}>
                        <CardHeader>
                            <CardTitle className={themeStyles.headerColor}>User Distribution</CardTitle>
                            <CardDescription>Users by role type</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-[350px] w-full items-center justify-center">
                                <PieChart
                                    series={userRolesData.series}
                                    labels={userRolesData.labels}
                                    colors={getThemeColors(
                                        ["#4A90E2", "#34A853", "#FBBC05", "#EA4335", "#9C27B0"], // Light mode colors
                                        ["#1E88E5", "#43A047", "#F9A825", "#E53935", "#8E24AA"]  // Dark mode colors
                                    )}
                                    width={300}
                                    height={300}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 3 - Multi-series chart to showcase more colors */}
                <div className="grid grid-cols-1">
                    <Card className={themeStyles.cardBackground}>
                        <CardHeader>
                            <CardTitle className={themeStyles.headerColor}>Sales Comparison</CardTitle>
                            <CardDescription>Year-over-year comparison of monthly sales</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LineChart
                                height={350}
                                series={multiSeriesData.series}
                                categories={multiSeriesData.categories}
                                colors={getThemeColors(
                                    ["#4A90E2", "#34A853"], // Light mode colors
                                    ["#1E88E5", "#43A047"]  // Dark mode colors
                                )}
                                yAxisWidth={50}
                                showXGrid={true}
                                showYGrid={true}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
