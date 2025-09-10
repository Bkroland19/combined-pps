"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Activity,
  Users,
  Pill,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  BarChart3,
  PieChartIcon,
  Settings,
  Bell,
  Search,
  Menu,
  Home,
  FileText,
  Shield,
  Database,
	Upload,
	TestTube,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
	PPSApi,
	PatientStats,
	AntibioticStats,
	SpecimenStats,
	Patient,
} from "@/lib/api";

// Data transformation utilities
const formatChartData = (
	data: Array<{ [key: string]: string | number }>,
	nameKey: string,
	valueKey: string
) => {
	return data.map((item, index) => ({
		name: item[nameKey] as string,
		value: item[valueKey] as number,
		color: `hsl(var(--chart-${(index % 5) + 1}))`,
		fill: `hsl(var(--chart-${(index % 5) + 1}))`,
	}));
};

export default function PPSDashboard() {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [activeSection, setActiveSection] = useState("overview");

	// API Data state
	const [patientStats, setPatientStats] = useState<PatientStats | null>(
		null
	);
	const [antibioticStats, setAntibioticStats] =
		useState<AntibioticStats | null>(null);
	const [specimenStats, setSpecimenStats] = useState<SpecimenStats | null>(
		null
	);
	const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch data on component mount
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);

				const [
					patientStatsRes,
					antibioticStatsRes,
					specimenStatsRes,
					patientsRes,
				] = await Promise.all([
					PPSApi.getPatientStats(),
					PPSApi.getAntibioticStats(),
					PPSApi.getSpecimenStats(),
					PPSApi.getPatients({ limit: 10 }),
				]);

				setPatientStats(patientStatsRes);
				setAntibioticStats(antibioticStatsRes);
				setSpecimenStats(specimenStatsRes);
				setRecentPatients(patientsRes.data);
			} catch (err) {
				console.error("Error fetching data:", err);
				setError(
					"Failed to load dashboard data. Please check your backend connection."
				);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
		{ id: "patients", label: "Patients", icon: Users },
		{ id: "antibiotics", label: "Antibiotics", icon: Pill },
		{ id: "specimens", label: "Specimens", icon: TestTube },
		{ id: "upload", label: "Data Upload", icon: Upload },
    { id: "database", label: "Database", icon: Database },
	];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div
				className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 transition-transform duration-300 ${
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
								<h2 className="font-bold text-slate-900 dark:text-slate-100">
									PPS System
								</h2>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Point Prevalence Survey
								</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
							const Icon = item.icon;
              return (
                <button
                  key={item.id}
									onClick={() =>
										setActiveSection(item.id)
									}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeSection === item.id
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
									<span className="font-medium">
										{item.label}
									</span>
                </button>
							);
            })}
          </nav>

          <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
						<Button
							variant="ghost"
							size="sm"
							className="w-full justify-start"
						>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

			<div
				className={`transition-all duration-300 ${
					sidebarOpen ? "ml-64" : "ml-0"
				}`}
			>
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										setSidebarOpen(!sidebarOpen)
									}
									className="lg:hidden"
								>
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
										Point Prevalence Survey
										Dashboard
                  </h1>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										Real-time monitoring and
										analytics
									</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
								<Button
									variant="ghost"
									size="sm"
								>
                  <Bell className="h-5 w-5" />
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
					{error && (
						<div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
							{error}
						</div>
					)}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200/50 dark:border-blue-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
									Total Patients
								</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
								<div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
									{loading
										? "..."
										: patientStats?.total_patients?.toLocaleString() ||
										  "0"}
								</div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
									Survey participants
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-emerald-200/50 dark:border-emerald-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
									Patients on Antibiotics
                </CardTitle>
                <div className="p-2 bg-emerald-500/10 rounded-lg">
									<Pill className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
								<div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
									{loading
										? "..."
										: patientStats?.patients_on_antibiotic?.toLocaleString() ||
										  "0"}
								</div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
									{patientStats?.total_patients
										? `${(
												(patientStats.patients_on_antibiotic /
													patientStats.total_patients) *
												100
										  ).toFixed(1)}% of total`
										: "Antibiotic usage"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200/50 dark:border-purple-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
									Total Antibiotics
                </CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Pill className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
								<div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
									{loading
										? "..."
										: antibioticStats?.total_antibiotics?.toLocaleString() ||
										  "0"}
								</div>
                <p className="text-xs text-purple-600 dark:text-purple-400">
									Antibiotic prescriptions
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200/50 dark:border-orange-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
									Total Specimens
								</CardTitle>
                <div className="p-2 bg-orange-500/10 rounded-lg">
									<TestTube className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
								<div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
									{loading
										? "..."
										: specimenStats?.total_specimens?.toLocaleString() ||
										  "0"}
								</div>
                <p className="text-xs text-orange-600 dark:text-orange-400">
									Lab specimens collected
                </p>
              </CardContent>
            </Card>
          </div>

          {activeSection === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
											Patients by Region
                    </CardTitle>
										<CardDescription>
											Distribution of patients
											across regions
										</CardDescription>
                  </CardHeader>
                  <CardContent>
										<ResponsiveContainer
											width="100%"
											height={300}
										>
											{loading ? (
												<div className="flex items-center justify-center h-full">
													<div className="text-muted-foreground">
														Loading...
													</div>
												</div>
											) : (
												<BarChart
													data={
														patientStats?.by_region ||
														[]
													}
												>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--muted-foreground))"
														strokeOpacity={
															0.2
														}
                        />
													<XAxis dataKey="region" />
                        <YAxis />
                        <Tooltip />
													<Bar
														dataKey="count"
														fill="hsl(var(--chart-1))"
														name="Patients"
													/>
												</BarChart>
											)}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-blue-600" />
											Antibiotic Classes
                    </CardTitle>
										<CardDescription>
											Distribution of
											antibiotic classes
										</CardDescription>
                  </CardHeader>
                  <CardContent>
										<ResponsiveContainer
											width="100%"
											height={300}
										>
											{loading ? (
												<div className="flex items-center justify-center h-full">
													<div className="text-muted-foreground">
														Loading...
													</div>
												</div>
											) : (
												<PieChart>
													<Pie
														data={formatChartData(
															antibioticStats?.by_class ||
																[],
															"class",
															"count"
														)}
														cx="50%"
														cy="50%"
														labelLine={
															false
														}
														label={({
															name,
															percent,
														}) =>
															`${name}\n${(
																percent *
																100
															).toFixed(
																1
															)}%`
														}
														outerRadius={
															120
														}
														fill="#8884d8"
                          dataKey="value"
														stroke="hsl(var(--background))"
														strokeWidth={
															2
														}
													>
														{formatChartData(
															antibioticStats?.by_class ||
																[],
															"class",
															"count"
														).map(
															(
																entry,
																index
															) => (
																<Cell
																	key={`cell-${index}`}
																	fill={
																		entry.color
																	}
																/>
															)
														)}
													</Pie>
													<Tooltip
														formatter={(
															value
														) => [
															`${value}`,
															"Count",
														]}
													/>
												</PieChart>
											)}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
										<TestTube className="h-5 w-5 text-purple-600" />
										Specimen Types
                  </CardTitle>
									<CardDescription>
										Distribution of specimen types
										collected
									</CardDescription>
                </CardHeader>
                <CardContent>
									<ResponsiveContainer
										width="100%"
										height={300}
									>
										{loading ? (
											<div className="flex items-center justify-center h-full">
												<div className="text-muted-foreground">
													Loading...
												</div>
											</div>
										) : (
											<BarChart
												data={
													specimenStats?.by_type ||
													[]
												}
											>
												<CartesianGrid
													strokeDasharray="3 3"
													stroke="hsl(var(--muted-foreground))"
													strokeOpacity={
														0.2
													}
												/>
												<XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
												<Bar
													dataKey="count"
													fill="hsl(var(--chart-3))"
													name="Specimens"
												/>
											</BarChart>
										)}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-emerald-600" />
											Antibiotic
											Classifications
                    </CardTitle>
										<CardDescription>
											WHO AWaRe classification
											distribution
										</CardDescription>
                  </CardHeader>
                  <CardContent>
										<ResponsiveContainer
											width="100%"
											height={350}
										>
											{loading ? (
												<div className="flex items-center justify-center h-full">
													<div className="text-muted-foreground">
														Loading...
													</div>
												</div>
											) : (
                      <PieChart>
                        <Pie
														data={formatChartData(
															antibioticStats?.by_classification ||
																[],
															"classification",
															"count"
														)}
                          cx="50%"
                          cy="50%"
														labelLine={
															false
														}
														label={({
															name,
															percent,
														}) =>
															`${name}\n${(
																percent *
																100
															).toFixed(
																1
															)}%`
														}
														outerRadius={
															120
														}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="hsl(var(--background))"
														strokeWidth={
															2
														}
													>
														{formatChartData(
															antibioticStats?.by_classification ||
																[],
															"classification",
															"count"
														).map(
															(
																entry,
																index
															) => (
																<Cell
																	key={`cell-${index}`}
																	fill={
																		entry.color
																	}
																/>
															)
														)}
                        </Pie>
													<Tooltip
														formatter={(
															value
														) => [
															`${value}`,
															"Count",
														]}
													/>
                      </PieChart>
											)}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
											Administration Routes
                    </CardTitle>
										<CardDescription>
											Antibiotic administration
											methods
										</CardDescription>
                  </CardHeader>
                  <CardContent>
										<ResponsiveContainer
											width="100%"
											height={350}
										>
											{loading ? (
												<div className="flex items-center justify-center h-full">
													<div className="text-muted-foreground">
														Loading...
													</div>
												</div>
											) : (
												<BarChart
													data={
														antibioticStats?.by_route ||
														[]
													}
												>
                        <defs>
														<linearGradient
															id="colorBar"
															x1="0"
															y1="0"
															x2="0"
															y2="1"
														>
															<stop
																offset="5%"
																stopColor="hsl(var(--chart-1))"
																stopOpacity={
																	0.8
																}
															/>
															<stop
																offset="95%"
																stopColor="hsl(var(--chart-1))"
																stopOpacity={
																	0.2
																}
															/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--muted-foreground))"
														strokeOpacity={
															0.2
														}
                        />
													<XAxis dataKey="route" />
                        <YAxis />
                        <Tooltip />
													<Bar
														dataKey="count"
														fill="url(#colorBar)"
														radius={[
															4, 4,
															0, 0,
														]}
														name="Antibiotics"
													/>
                      </BarChart>
											)}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

					{activeSection === "antibiotics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
										<CardTitle>
											Antibiotic Classes
										</CardTitle>
										<CardDescription>
											Distribution of
											antibiotic classes used
										</CardDescription>
                  </CardHeader>
                  <CardContent>
										<ResponsiveContainer
											width="100%"
											height={300}
										>
											{loading ? (
												<div className="flex items-center justify-center h-full">
													<div className="text-muted-foreground">
														Loading...
													</div>
												</div>
											) : (
                      <PieChart>
                        <Pie
														data={formatChartData(
															antibioticStats?.by_class ||
																[],
															"class",
															"count"
														)}
                          cx="50%"
                          cy="50%"
														labelLine={
															false
														}
														label={({
															name,
															percent,
														}) =>
															`${name} ${(
																percent *
																100
															).toFixed(
																0
															)}%`
														}
														outerRadius={
															80
														}
                          fill="#8884d8"
                          dataKey="value"
                        >
														{formatChartData(
															antibioticStats?.by_class ||
																[],
															"class",
															"count"
														).map(
															(
																entry,
																index
															) => (
																<Cell
																	key={`cell-${index}`}
																	fill={
																		entry.color
																	}
																/>
															)
														)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
											)}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
										<CardTitle>
											Dose Frequency
										</CardTitle>
										<CardDescription>
											Distribution of
											antibiotic dosing
											frequencies
										</CardDescription>
                  </CardHeader>
                  <CardContent>
										<ResponsiveContainer
											width="100%"
											height={300}
										>
											{loading ? (
												<div className="flex items-center justify-center h-full">
													<div className="text-muted-foreground">
														Loading...
													</div>
												</div>
											) : (
												<BarChart
													data={
														antibioticStats?.by_frequency ||
														[]
													}
												>
                        <CartesianGrid strokeDasharray="3 3" />
													<XAxis dataKey="frequency" />
                        <YAxis />
                        <Tooltip />
													<Bar
														dataKey="count"
														fill="hsl(var(--chart-1))"
														name="Antibiotics"
													/>
                      </BarChart>
											)}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

					{activeSection === "patients" && (
						<div className="space-y-6">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
										<CardTitle>
											Patients by Facility
										</CardTitle>
										<CardDescription>
											Distribution across
											healthcare facilities
										</CardDescription>
              </CardHeader>
              <CardContent>
										<ResponsiveContainer
											width="100%"
											height={300}
										>
											{loading ? (
												<div className="flex items-center justify-center h-full">
													<div className="text-muted-foreground">
														Loading...
                  </div>
                  </div>
											) : (
												<BarChart
													data={
														patientStats?.by_facility ||
														[]
													}
													layout="horizontal"
												>
													<CartesianGrid strokeDasharray="3 3" />
													<XAxis type="number" />
													<YAxis
														dataKey="facility"
														type="category"
														width={
															100
														}
													/>
													<Tooltip />
													<Bar
														dataKey="count"
														fill="hsl(var(--chart-2))"
														name="Patients"
													/>
												</BarChart>
											)}
										</ResponsiveContainer>
									</CardContent>
								</Card>

								<Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
									<CardHeader>
										<CardTitle>
											Patients by Ward
										</CardTitle>
										<CardDescription>
											Ward-wise patient
											distribution
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ResponsiveContainer
											width="100%"
											height={300}
										>
											{loading ? (
												<div className="flex items-center justify-center h-full">
													<div className="text-muted-foreground">
														Loading...
                  </div>
                </div>
											) : (
												<BarChart
													data={
														patientStats?.by_ward ||
														[]
													}
												>
													<CartesianGrid strokeDasharray="3 3" />
													<XAxis dataKey="ward" />
													<YAxis />
													<Tooltip />
													<Bar
														dataKey="count"
														fill="hsl(var(--chart-3))"
														name="Patients"
													/>
												</BarChart>
											)}
										</ResponsiveContainer>
									</CardContent>
								</Card>
							</div>
						</div>
					)}

					{activeSection === "specimens" && (
						<div className="space-y-6">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
									<CardHeader>
										<CardTitle>
											Culture Results
										</CardTitle>
										<CardDescription>
											Distribution of culture
											results
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ResponsiveContainer
											width="100%"
											height={300}
										>
											{loading ? (
												<div className="flex items-center justify-center h-full">
													<div className="text-muted-foreground">
														Loading...
													</div>
												</div>
											) : (
												<PieChart>
													<Pie
														data={formatChartData(
															specimenStats?.by_result ||
																[],
															"result",
															"count"
														)}
														cx="50%"
														cy="50%"
														labelLine={
															false
														}
														label={({
															name,
															percent,
														}) =>
															`${name}\n${(
																percent *
																100
															).toFixed(
																1
															)}%`
														}
														outerRadius={
															80
														}
														fill="#8884d8"
														dataKey="value"
													>
														{formatChartData(
															specimenStats?.by_result ||
																[],
															"result",
															"count"
														).map(
															(
																entry,
																index
															) => (
																<Cell
																	key={`cell-${index}`}
																	fill={
																		entry.color
																	}
																/>
															)
														)}
													</Pie>
													<Tooltip />
												</PieChart>
											)}
										</ResponsiveContainer>
									</CardContent>
								</Card>

								<Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
									<CardHeader>
										<CardTitle>
											Microorganisms
										</CardTitle>
										<CardDescription>
											Most common
											microorganisms identified
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ResponsiveContainer
											width="100%"
											height={300}
										>
											{loading ? (
												<div className="flex items-center justify-center h-full">
													<div className="text-muted-foreground">
														Loading...
													</div>
												</div>
											) : (
												<BarChart
													data={
														specimenStats?.by_microorganism ||
														[]
													}
													layout="horizontal"
												>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
													<YAxis
														dataKey="microorganism"
														type="category"
														width={
															100
														}
													/>
                    <Tooltip />
													<Bar
														dataKey="count"
														fill="hsl(var(--chart-4))"
														name="Count"
													/>
                  </BarChart>
											)}
                </ResponsiveContainer>
              </CardContent>
            </Card>
							</div>
						</div>
          )}

					{activeSection === "upload" && (
						<div className="space-y-6">
            <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Upload className="h-5 w-5 text-emerald-600" />
										Data Upload
									</CardTitle>
									<CardDescription>
										Upload CSV files to import
										survey data
									</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										<Button
											variant="outline"
											className="h-24 flex-col bg-transparent"
										>
											<Users className="h-6 w-6 mb-2" />
											Upload Patients
                  </Button>
										<Button
											variant="outline"
											className="h-24 flex-col bg-transparent"
										>
                    <Pill className="h-6 w-6 mb-2" />
											Upload Antibiotics
                  </Button>
										<Button
											variant="outline"
											className="h-24 flex-col bg-transparent"
										>
											<FileText className="h-6 w-6 mb-2" />
											Upload Indications
                  </Button>
										<Button
											variant="outline"
											className="h-24 flex-col bg-transparent"
										>
											<Settings className="h-6 w-6 mb-2" />
											Upload Optional Vars
                  </Button>
										<Button
											variant="outline"
											className="h-24 flex-col bg-transparent"
										>
											<TestTube className="h-6 w-6 mb-2" />
											Upload Specimens
                  </Button>
                </div>
              </CardContent>
            </Card>
						</div>
          )}

          {activeSection === "database" && (
            <div className="space-y-6">
              <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-slate-600" />
										Recent Patients
                  </CardTitle>
									<CardDescription>
										Latest patient survey data
									</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
													<th className="text-left py-3 px-4 font-medium">
														Patient
														Code
													</th>
													<th className="text-left py-3 px-4 font-medium">
														Facility
													</th>
													<th className="text-left py-3 px-4 font-medium">
														Ward
													</th>
													<th className="text-left py-3 px-4 font-medium">
														Survey
														Date
													</th>
													<th className="text-left py-3 px-4 font-medium">
														On
														Antibiotic
													</th>
                        </tr>
                      </thead>
                      <tbody>
												{loading ? (
													<tr>
														<td
															colSpan={
																5
															}
															className="py-8 text-center text-muted-foreground"
														>
															Loading...
														</td>
													</tr>
												) : recentPatients.length ===
												  0 ? (
													<tr>
														<td
															colSpan={
																5
															}
															className="py-8 text-center text-muted-foreground"
														>
															No
															patients
															found
														</td>
													</tr>
												) : (
													recentPatients.map(
														(
															patient
														) => (
															<tr
																key={
																	patient.id
																}
																className="border-b hover:bg-muted/50"
															>
																<td className="py-3 px-4 font-mono text-sm">
																	{
																		patient.patient_code
																	}
																</td>
                            <td className="py-3 px-4">
																	{
																		patient.facility
																	}
                            </td>
                            <td className="py-3 px-4">
																	{
																		patient.ward_name
																	}
																</td>
																<td className="py-3 px-4 text-muted-foreground">
																	{new Date(
																		patient.survey_date
																	).toLocaleDateString()}
																</td>
																<td className="py-3 px-4">
																	<Badge
																		variant={
																			patient.patient_on_antibiotic ===
																			"yes"
																				? "default"
																				: "secondary"
																		}
																	>
																		{patient.patient_on_antibiotic ===
																		"yes"
																			? "Yes"
																			: "No"}
																	</Badge>
                            </td>
                          </tr>
														)
													)
												)}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
	);
}
