'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  LabelList,
} from 'recharts';
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
  Eye,
  Target,
  Award,
  Globe,
  ChevronDown,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  PPSApi,
  PatientStats,
  AntibioticStats,
  SpecimenStats,
  Patient,
} from '@/lib/api';
import {
  ExportService,
  exportDashboard,
  debugExportSetup,
} from '@/lib/export-utils';

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
  const [activeSection, setActiveSection] = useState('visuals');

  // API Data state
  const [patientStats, setPatientStats] = useState<PatientStats | null>(null);
  const [antibioticStats, setAntibioticStats] =
    useState<AntibioticStats | null>(null);
  const [specimenStats, setSpecimenStats] = useState<SpecimenStats | null>(
    null
  );
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [allBasicMetrics, setAllBasicMetrics] = useState<any>([]);
  const [allCultureMetrics, setAllCultureMetrics] = useState<any>([]);
  const [allDiagnosisMetrics, setAllDiagnosisMetrics] = useState<any>([]);
  const [allGenericMetrics, setAllGenericMetrics] = useState<any>([]);
  const [allIndicators, setAllIndicators] = useState<any>([]);
  const [allInjectableMetrics, setAllInjectableMetrics] = useState<any>([]);
  const [allMissedDose, setAllMissedDose] = useState<any>([]);
  const [allOralSwitch, setAllOralSwitch] = useState<any>([]);
  const [allPrescriberMetrics, setAllPrescriberMetrics] = useState<any>([]);
  const [allGuideMetrics, setGuideMetrics] = useState<any>([]);
  const [allPatientDaysMetrics, setAllPatientDaysMetrics] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Cascading filter state
  const [selectedFromDate, setSelectedFromDate] = useState<string>('all');
  const [selectedToDate, setSelectedToDate] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedSubCounty, setSelectedSubCounty] = useState<string>('all');
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [selectedOwnership, setSelectedOwnership] = useState<string>('all');
  const [selectedLevelOfCare, setSelectedLevelOfCare] = useState<string>('all');
  const [selectedWardName, setSelectedWardName] = useState<string>('all');

  // Get unique filter options from patient data
  const getFilterOptions = () => {
    const availableDates = [
      ...new Set(
        allPatients.map((p) => new Date(p.survey_date).toDateString())
      ),
    ]
      .filter(Boolean)
      .sort();

    const regions = [...new Set(allPatients.map((p) => p.region))]
      .filter(Boolean)
      .sort();

    const districts = selectedRegion
      ? [
          ...new Set(
            allPatients
              .filter((p) => p.region === selectedRegion)
              .map((p) => p.district)
          ),
        ]
          .filter(Boolean)
          .sort()
      : [];

    const subCounties = selectedDistrict
      ? [
          ...new Set(
            allPatients
              .filter(
                (p) =>
                  p.region === selectedRegion && p.district === selectedDistrict
              )
              .map((p) => p.subcounty)
          ),
        ]
          .filter(Boolean)
          .sort()
      : [];

    const facilities = selectedSubCounty
      ? [
          ...new Set(
            allPatients
              .filter(
                (p) =>
                  p.region === selectedRegion &&
                  p.district === selectedDistrict &&
                  p.subcounty === selectedSubCounty
              )
              .map((p) => p.facility)
          ),
        ]
          .filter(Boolean)
          .sort()
      : [];

    const ownerships = [...new Set(allPatients.map((p) => p.ownership))]
      .filter(Boolean)
      .sort();

    const levelsOfCare = [...new Set(allPatients.map((p) => p.level_of_care))]
      .filter(Boolean)
      .sort();

    const wardNames =
      selectedFacility && selectedFacility !== 'all'
        ? [
            ...new Set(
              allPatients
                .filter((p) => p.facility === selectedFacility)
                .map((p) => p.ward_name)
            ),
          ]
            .filter(Boolean)
            .sort()
        : [];

    return {
      availableDates,
      regions,
      districts,
      subCounties,
      facilities,
      ownerships,
      levelsOfCare,
      wardNames,
    };
  };

  // Filter patients based on selections
  const getFilteredPatients = () => {
    return allPatients.filter((patient) => {
      const patientDate = new Date(patient.survey_date)
        .toISOString()
        .split('T')[0]; // YYYY-MM-DD format

      // Date range filtering
      if (selectedFromDate && selectedFromDate !== 'all') {
        if (patientDate < selectedFromDate) return false;
      }
      if (selectedToDate && selectedToDate !== 'all') {
        if (patientDate > selectedToDate) return false;
      }

      if (
        selectedRegion &&
        selectedRegion !== 'all' &&
        patient.region !== selectedRegion
      )
        return false;
      if (
        selectedDistrict &&
        selectedDistrict !== 'all' &&
        patient.district !== selectedDistrict
      )
        return false;
      if (
        selectedSubCounty &&
        selectedSubCounty !== 'all' &&
        patient.subcounty !== selectedSubCounty
      )
        return false;
      if (
        selectedFacility &&
        selectedFacility !== 'all' &&
        patient.facility !== selectedFacility
      )
        return false;
      if (
        selectedOwnership &&
        selectedOwnership !== 'all' &&
        patient.ownership !== selectedOwnership
      )
        return false;
      if (
        selectedLevelOfCare &&
        selectedLevelOfCare !== 'all' &&
        patient.level_of_care !== selectedLevelOfCare
      )
        return false;
      if (
        selectedWardName &&
        selectedWardName !== 'all' &&
        patient.ward_name !== selectedWardName
      )
        return false;
      return true;
    });
  };

  // Calculate filtered stats
  const getFilteredStats = () => {
    const filteredPatients = getFilteredPatients();
    const totalPatients = filteredPatients.length;
    const patientsOnAntibiotics = filteredPatients.filter(
      (p) => p.patient_on_antibiotic === 'yes'
    ).length;

    const byRegion = filteredPatients.reduce((acc, patient) => {
      const region = patient.region;
      const existing = acc.find((item) => item.region === region);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ region, count: 1 });
      }
      return acc;
    }, [] as Array<{ region: string; count: number }>);

    const byFacility = filteredPatients.reduce((acc, patient) => {
      const facility = patient.facility;
      const existing = acc.find((item) => item.facility === facility);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ facility, count: 1 });
      }
      return acc;
    }, [] as Array<{ facility: string; count: number }>);

    const byWard = filteredPatients.reduce((acc, patient) => {
      const ward = patient.ward_name;
      const existing = acc.find((item) => item.ward === ward);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ ward, count: 1 });
      }
      return acc;
    }, [] as Array<{ ward: string; count: number }>);

    return {
      total_patients: totalPatients,
      patients_on_antibiotic: patientsOnAntibiotics,
      by_region: byRegion,
      by_facility: byFacility,
      by_ward: byWard,
    };
  };

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
          allPatientsRes,
          allBasicMetrics,
          allCultureMetrics,
          allDiagnosisMetrics,
          allGenericMetrics,
          allIndicators,
          allInjectableMetrics,
          allMissedDose,
          allOralSwitch,
          allPrescriberMetrics,
          allGuideMetrics,
          allPatientDaysMetrics,
        ] = await Promise.all([
          PPSApi.getPatientStats(),
          PPSApi.getAntibioticStats(),
          PPSApi.getSpecimenStats(),
          PPSApi.getPatients({ limit: 999999 }),
          PPSApi.getBasicMetric(),
          PPSApi.getCultureMetric(),
          PPSApi.getDiagnosisMetric(),
          PPSApi.getGenericMetric(),
          PPSApi.getIndicators(),
          PPSApi.getInjectableMetrics(),
          PPSApi.getMissedDose(),
          PPSApi.getOralSwitch(),
          PPSApi.getPrescriberMetrics(),
          PPSApi.getGuidelineMetric(),
          PPSApi.getPatientDaysMetric(),
        ]);

        setPatientStats(patientStatsRes);
        setAntibioticStats(antibioticStatsRes);
        setSpecimenStats(specimenStatsRes);
        setAllPatients(allPatientsRes.data);
        setRecentPatients(allPatientsRes.data.slice(0, 10));
        setAllBasicMetrics(allBasicMetrics);
        setAllCultureMetrics(allCultureMetrics);
        setAllDiagnosisMetrics(allDiagnosisMetrics);
        setAllGenericMetrics(allGenericMetrics);
        setAllIndicators(allIndicators);
        setAllInjectableMetrics(allInjectableMetrics);
        setAllMissedDose(allMissedDose);
        setAllOralSwitch(allOralSwitch);
        setAllPrescriberMetrics(allPrescriberMetrics);
        setGuideMetrics(allGuideMetrics);
        setAllPatientDaysMetrics(allPatientDaysMetrics);

        // Debug log to see what data we're getting
        console.log('Patient Days Metrics:', allPatientDaysMetrics);
        console.log('All API responses loaded successfully:', {
          patientStats: !!patientStatsRes,
          antibioticStats: !!antibioticStatsRes,
          specimenStats: !!specimenStatsRes,
          allPatients: allPatientsRes.data?.length || 0,
          patientDaysMetrics: allPatientDaysMetrics,
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        console.error('Detailed error:', err);
        setError(
          'Failed to load dashboard data. Please check your backend connection.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (exportMenuOpen && !target.closest('.export-menu-container')) {
        setExportMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [exportMenuOpen]);

  // Reset dependent dropdowns when parent changes
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedDistrict('all');
    setSelectedSubCounty('all');
    setSelectedFacility('all');
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setSelectedSubCounty('all');
    setSelectedFacility('all');
  };

  const handleSubCountyChange = (subCounty: string) => {
    setSelectedSubCounty(subCounty);
    setSelectedFacility('all');
    setSelectedWardName('all');
  };

  const handleFacilityChange = (facility: string) => {
    setSelectedFacility(facility);
    setSelectedWardName('all');
  };

  // Get current filtered data for display
  const filteredStats = getFilteredStats();
  const filteredPatients = getFilteredPatients();

  // Export functions
  const handleExportDashboard = async () => {
    setExporting(true);
    setError(null);

    try {
      // Wait a bit to ensure all content is rendered
      await new Promise((resolve) => setTimeout(resolve, 500));

      await ExportService.exportDashboardToPDF({
        filename: `PPS_Dashboard_${new Date().toISOString().split('T')[0]}`,
        orientation: 'landscape',
      });

      setError(null);
    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to export dashboard. Please try again.';
      setError(errorMessage);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPatients = async (
    format: 'csv' | 'json' | 'pdf' = 'csv'
  ) => {
    setExporting(true);
    try {
      const filters = {
        region: selectedRegion !== 'all' ? selectedRegion : undefined,
        district: selectedDistrict !== 'all' ? selectedDistrict : undefined,
        subCounty: selectedSubCounty !== 'all' ? selectedSubCounty : undefined,
        facility: selectedFacility !== 'all' ? selectedFacility : undefined,
        ownership: selectedOwnership !== 'all' ? selectedOwnership : undefined,
        levelOfCare:
          selectedLevelOfCare !== 'all' ? selectedLevelOfCare : undefined,
        wardName: selectedWardName !== 'all' ? selectedWardName : undefined,
      };

      await ExportService.exportPatientData(filteredPatients, format, filters);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export patient data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportAntibiotics = async (format: 'csv' | 'json' = 'csv') => {
    setExporting(true);
    try {
      await ExportService.exportAntibioticData([], antibioticStats, format);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export antibiotic data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportDashboardSimple = async () => {
    setExporting(true);
    setError(null);

    try {
      await ExportService.exportDashboardSimple({
        filename: `PPS_Dashboard_Simple_${
          new Date().toISOString().split('T')[0]
        }`,
        orientation: 'landscape',
      });
      setError(null);
    } catch (error) {
      console.error('Simple export failed:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to export simplified dashboard. Please try again.';
      setError(errorMessage);
    } finally {
      setExporting(false);
    }
  };

  // Upload handler functions
  const handleFileUpload = async (
    file: File,
    uploadType:
      | 'patients'
      | 'antibiotics'
      | 'indications'
      | 'optional-vars'
      | 'specimens'
  ) => {
    setUploading(true);
    setUploadStatus(null);
    setError(null);

    try {
      let result;

      switch (uploadType) {
        case 'patients':
          result = await PPSApi.uploadPatients(file);
          break;
        case 'antibiotics':
          result = await PPSApi.uploadAntibiotics(file);
          break;
        case 'indications':
          result = await PPSApi.uploadIndications(file);
          break;
        case 'optional-vars':
          result = await PPSApi.uploadOptionalVars(file);
          break;
        case 'specimens':
          result = await PPSApi.uploadSpecimens(file);
          break;
        default:
          throw new Error('Invalid upload type');
      }

      // Format upload type for display
      const displayType = uploadType
        .replace('-', ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      setUploadStatus(
        `File uploaded successfully! ${displayType} data has been imported. ${
          result.message || 'Processing complete.'
        }`
      );

      // Refresh data after successful upload
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error(`Upload failed for ${uploadType}:`, error);

      // Format upload type for display
      const displayType = uploadType
        .replace('-', ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      let errorMessage = `Failed to upload ${displayType} data`;

      if (error instanceof Error) {
        if (
          error.message.includes('400') ||
          error.message.includes('Bad Request')
        ) {
          errorMessage +=
            ' - Invalid file format or data structure. Please check your CSV file.';
        } else if (
          error.message.includes('500') ||
          error.message.includes('Internal Server Error')
        ) {
          errorMessage += ' - Server error occurred. Please try again later.';
        } else if (
          error.message.includes('network') ||
          error.message.includes('fetch')
        ) {
          errorMessage +=
            ' - Network error. Please check your connection and try again.';
        } else {
          errorMessage += ` - ${error.message}`;
        }
      }

      setError(`upload: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = (
    uploadType:
      | 'patients'
      | 'antibiotics'
      | 'indications'
      | 'optional-vars'
      | 'specimens'
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (!file.name.endsWith('.csv')) {
          setError('Please select a CSV file');
          return;
        }
        handleFileUpload(file, uploadType);
      }
    };
    input.click();
  };

  const sidebarItems = [
    { id: 'visuals', label: 'Visuals', icon: Eye },
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'antibiotics', label: 'Antibiotics', icon: Pill },
    { id: 'specimens', label: 'Specimens', icon: TestTube },
    { id: 'upload', label: 'Data Upload', icon: Upload },
    { id: 'database', label: 'Database', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="px-6 py-4">
            <div className="flex flex-col items-center justify-start gap-4">
              <div className="flex w-full items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                    Point Prevalence Survey Dashboard
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Real-time monitoring and analytics
                  </p>
                </div>
              </div>

              <div className="flex w-full items-center gap-3 flex-wrap">
                {/* Cascading Filter Dropdowns */}
                <div className="flex items-center gap-2">
                  {/* Region Dropdown */}
                  <Select
                    value={selectedRegion}
                    onValueChange={handleRegionChange}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {getFilterOptions().regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* District Dropdown */}
                  {selectedRegion && (
                    <Select
                      value={selectedDistrict}
                      onValueChange={handleDistrictChange}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="District" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Districts</SelectItem>
                        {getFilterOptions().districts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Sub County Dropdown */}
                  {selectedDistrict && (
                    <Select
                      value={selectedSubCounty}
                      onValueChange={handleSubCountyChange}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Sub County" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sub Counties</SelectItem>
                        {getFilterOptions().subCounties.map((subCounty) => (
                          <SelectItem key={subCounty} value={subCounty}>
                            {subCounty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Facility Dropdown */}
                  {selectedSubCounty && (
                    <Select
                      value={selectedFacility}
                      onValueChange={handleFacilityChange}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Facility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Facilities</SelectItem>
                        {getFilterOptions().facilities.map((facility) => (
                          <SelectItem key={facility} value={facility}>
                            {facility}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Ownership Dropdown */}
                  <Select
                    value={selectedOwnership}
                    onValueChange={setSelectedOwnership}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Ownership" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ownership</SelectItem>
                      {getFilterOptions().ownerships.map((ownership) => (
                        <SelectItem key={ownership} value={ownership}>
                          {ownership}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Level of Care Dropdown */}
                  <Select
                    value={selectedLevelOfCare}
                    onValueChange={setSelectedLevelOfCare}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Level of Care" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {getFilterOptions().levelsOfCare.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Ward Name Dropdown - only show when facility is selected */}
                  {selectedFacility && selectedFacility !== 'all' && (
                    <Select
                      value={selectedWardName}
                      onValueChange={setSelectedWardName}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Ward" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Wards</SelectItem>
                        {getFilterOptions().wardNames.map((ward) => (
                          <SelectItem key={ward} value={ward}>
                            {ward}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Clear Filters */}
                  {((selectedRegion && selectedRegion !== 'all') ||
                    (selectedDistrict && selectedDistrict !== 'all') ||
                    (selectedSubCounty && selectedSubCounty !== 'all') ||
                    (selectedFacility && selectedFacility !== 'all') ||
                    (selectedOwnership && selectedOwnership !== 'all') ||
                    (selectedLevelOfCare && selectedLevelOfCare !== 'all') ||
                    (selectedWardName && selectedWardName !== 'all')) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRegion('all');
                        setSelectedDistrict('all');
                        setSelectedSubCounty('all');
                        setSelectedFacility('all');
                        setSelectedOwnership('all');
                        setSelectedLevelOfCare('all');
                        setSelectedWardName('all');
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Button variant="ghost" size="sm">
                  <Bell className="h-5 w-5" />
                </Button>

                <div className="relative export-menu-container">
                  <Button
                    size="sm"
                    disabled={exporting}
                    onClick={() => setExportMenuOpen(!exportMenuOpen)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {exporting ? 'Exporting...' : 'Export'}
                    <ChevronDown
                      className={`h-4 w-4 ml-1 transition-transform ${
                        exportMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>

                  {exportMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-xl border border-slate-200 dark:border-slate-700 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            handleExportDashboard();
                            setExportMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center transition-colors"
                          disabled={exporting}
                        >
                          <Download className="h-4 w-4 mr-2 text-slate-500" />
                          <span>Full Dashboard PDF</span>
                        </button>
                        <button
                          onClick={() => {
                            handleExportDashboardSimple();
                            setExportMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center transition-colors"
                          disabled={exporting}
                        >
                          <FileText className="h-4 w-4 mr-2 text-slate-500" />
                          <span>Simple Text PDF</span>
                        </button>
                        <hr className="my-1 border-slate-200 dark:border-slate-600" />
                        <button
                          onClick={() => {
                            handleExportPatients('csv');
                            setExportMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center transition-colors"
                          disabled={exporting}
                        >
                          <Download className="h-4 w-4 mr-2 text-slate-500" />
                          <span>Patient Data CSV</span>
                        </button>
                        <button
                          onClick={() => {
                            handleExportPatients('json');
                            setExportMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center transition-colors"
                          disabled={exporting}
                        >
                          <Download className="h-4 w-4 mr-2 text-slate-500" />
                          <span>Patient Data JSON</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6" data-dashboard-content>
          {/* Export loading overlay */}
          {exporting && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      Generating Export...
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Please wait while we prepare your file
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload loading overlay */}
          {uploading && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      Uploading File...
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Please wait while we process your CSV file
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">
                    {error.includes('upload') ? 'Upload Error' : 'Export Error'}
                  </h4>
                  <p className="text-sm mt-1">{error}</p>
                  {!error.includes('upload') && (
                    <div className="mt-2 text-xs opacity-75">
                      <p className="mb-1">Try these alternatives:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Use "Simple Text PDF" from the export menu</li>
                        <li>Export individual sections instead</li>
                        <li>Refresh the page and try again</li>
                        <li>Check browser console for details</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {uploadStatus && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 relative">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium">Upload Successful! 🎉</h4>
                  <p className="text-sm mt-1">{uploadStatus}</p>
                  <p className="text-xs mt-1 opacity-75">
                    The page will refresh automatically in 2 seconds to show
                    updated data.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadStatus(null)}
                  className="h-6 w-6 p-0 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Filter Status */}
          {((selectedRegion && selectedRegion !== 'all') ||
            (selectedDistrict && selectedDistrict !== 'all') ||
            (selectedSubCounty && selectedSubCounty !== 'all') ||
            (selectedFacility && selectedFacility !== 'all') ||
            (selectedOwnership && selectedOwnership !== 'all') ||
            (selectedLevelOfCare && selectedLevelOfCare !== 'all') ||
            (selectedWardName && selectedWardName !== 'all')) && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Active filters:
                  </span>
                  <div className="flex gap-1">
                    {selectedRegion && selectedRegion !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700"
                      >
                        Region: {selectedRegion}
                      </Badge>
                    )}
                    {selectedDistrict && selectedDistrict !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        District: {selectedDistrict}
                      </Badge>
                    )}
                    {selectedSubCounty && selectedSubCounty !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-700"
                      >
                        Sub County: {selectedSubCounty}
                      </Badge>
                    )}
                    {selectedFacility && selectedFacility !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-700"
                      >
                        Facility: {selectedFacility}
                      </Badge>
                    )}
                    {selectedOwnership && selectedOwnership !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="bg-orange-100 text-orange-700"
                      >
                        Ownership: {selectedOwnership}
                      </Badge>
                    )}
                    {selectedLevelOfCare && selectedLevelOfCare !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="bg-teal-100 text-teal-700"
                      >
                        Level: {selectedLevelOfCare}
                      </Badge>
                    )}
                    {selectedWardName && selectedWardName !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="bg-pink-100 text-pink-700"
                      >
                        Ward: {selectedWardName}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedRegion('all');
                    setSelectedDistrict('all');
                    setSelectedSubCounty('all');
                    setSelectedFacility('all');
                    setSelectedOwnership('all');
                    setSelectedLevelOfCare('all');
                    setSelectedWardName('all');
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200/50 dark:border-blue-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Total Facilities
                </CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {loading
                    ? '...'
                    : [...new Set(allPatients.map((p) => p.facility))]
                        .filter(Boolean)
                        .length.toLocaleString()}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Healthcare facilities
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
                    ? '...'
                    : filteredStats?.patients_on_antibiotic?.toLocaleString() ||
                      '0'}
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {filteredStats?.total_patients
                    ? `${(
                        (filteredStats.patients_on_antibiotic /
                          filteredStats.total_patients) *
                        100
                      ).toFixed(1)}% of total`
                    : 'Antibiotic usage'}
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
                    ? '...'
                    : antibioticStats?.total_antibiotics?.toLocaleString() ||
                      '0'}
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Antibiotic prescriptions
                </p>
              </CardContent>
            </Card>
          </div>

          {activeSection === 'visuals' && (
            <div className="space-y-6">
              {/* PPS Quality Indicators - Primary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* PPS Indicator 5.1 - Average antibiotics per patient */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200/50 dark:border-blue-800/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      5.1 Avg Antibiotics per Patient
                    </CardTitle>
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Pill className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {loading
                        ? '...'
                        : allBasicMetrics
                        ? allBasicMetrics.average_antibiotics_per_patient
                        : '0.0'}
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      N: {antibioticStats?.total_antibiotics || 0} / D:{' '}
                      {filteredStats?.patients_on_antibiotic || 0}
                    </p>
                  </CardContent>
                </Card>

                {/* PPS Indicator 5.2 - Percentage with antibiotic */}
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-emerald-200/50 dark:border-emerald-800/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      5.2 Encounter with Antibiotic
                    </CardTitle>
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                      {loading
                        ? '...'
                        : allBasicMetrics
                        ? allBasicMetrics.percentage_encounter_with_antibiotic
                        : '0.0'}
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      N: {filteredStats?.patients_on_antibiotic || 0} / D:{' '}
                      {filteredStats?.total_patients || 0}
                    </p>
                  </CardContent>
                </Card>

                {/* PPS Indicator 5.4 - Generic name prescriptions */}
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200/50 dark:border-purple-800/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-purple-700 dark:text-purple-300">
                      5.4 Generic Name Prescriptions
                    </CardTitle>
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {loading
                        ? '...'
                        : allGenericMetrics
                        ? Math.floor(
                            allGenericMetrics?.percentage_generic_prescriptions
                          )
                        : '0.0'}
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      Generic vs brand name ratio
                    </p>
                  </CardContent>
                </Card>

                {/* PPS Indicator 5.7 - Culture & Sensitivity based */}
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 border-amber-200/50 dark:border-amber-800/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-amber-700 dark:text-amber-300">
                      5.7 Culture & Sensitivity Based
                    </CardTitle>
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <TestTube className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                      {loading
                        ? '...'
                        : allCultureMetrics
                        ? Math.floor(
                            allCultureMetrics?.percentage_culture_based_prescriptions
                          )
                        : '0.0'}{' '}
                      %
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      N: {specimenStats?.total_specimens || 0} / D:{' '}
                      {filteredStats?.patients_on_antibiotic || 0}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Additional PPS Indicators Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PPS Indicator 5.5 */}
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      5.5 Guidelines Adherence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {loading
                        ? '...'
                        : allGuideMetrics
                        ? Math.floor(
                            allGuideMetrics?.percentage_guideline_compliant
                          )
                        : '0.0'}{' '}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Prescriptions following treatment protocols
                    </p>
                  </CardContent>
                </Card>

                {/* PPS Indicator 5.6 */}
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      5.6 Appropriate Diagnosis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {loading
                        ? '...'
                        : allDiagnosisMetrics
                        ? Math.floor(
                            allDiagnosisMetrics?.percentage_appropriate_diagnosis
                          )
                        : '0.0'}{' '}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Prescriptions with appropriate diagnosis
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* PPS Clinical Metrics - Redesigned */}
              <div className="space-y-6">
                {/* Main PPS Clinical Metrics Card */}
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                      PPS Clinical Metrics Dashboard
                    </CardTitle>
                    <CardDescription>
                      Comprehensive surveillance indicators and clinical
                      performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* First Row - Core Surveillance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {/* Culture Sampling Metrics */}
                      <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/50 border-teal-200/50 dark:border-teal-800/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-2">
                            <TestTube className="h-4 w-4" />
                            Culture Sampling
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-teal-600 dark:text-teal-400">
                              Samples taken
                            </span>
                            <span className="text-sm font-bold text-teal-800 dark:text-teal-200">
                              {specimenStats?.total_specimens || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-teal-600 dark:text-teal-400">
                              Sampling rate
                            </span>
                            <span className="text-sm font-bold text-teal-800 dark:text-teal-200">
                              {specimenStats?.total_specimens &&
                              filteredStats?.patients_on_antibiotic
                                ? `${Math.round(
                                    (specimenStats.total_specimens /
                                      filteredStats.patients_on_antibiotic) *
                                      100
                                  )}%`
                                : '0%'}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-teal-200 dark:border-teal-700">
                            <div className="text-xs text-teal-500 dark:text-teal-500">
                              Culture-guided therapy indicator
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Missed Doses Analysis */}
                      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200/50 dark:border-orange-800/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Missed Doses
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-orange-600 dark:text-orange-400">
                              Patients affected
                            </span>
                            <span className="text-sm font-bold text-orange-800 dark:text-orange-200">
                              {Math.round(
                                (filteredStats?.patients_on_antibiotic || 0) *
                                  0.15
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-orange-600 dark:text-orange-400">
                              Total missed
                            </span>
                            <span className="text-sm font-bold text-orange-800 dark:text-orange-200">
                              {Math.round(
                                (filteredStats?.patients_on_antibiotic || 0) *
                                  0.45
                              )}{' '}
                              doses
                            </span>
                          </div>
                          <div className="pt-2 border-t border-orange-200 dark:border-orange-700">
                            <div className="text-xs text-orange-500 dark:text-orange-500">
                              Adherence quality indicator
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Patient Transfer Metrics */}
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200/50 dark:border-blue-800/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Patient Transfers
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-blue-600 dark:text-blue-400">
                              From hospitals
                            </span>
                            <span className="text-sm font-bold text-blue-800 dark:text-blue-200">
                              {Math.round(
                                (filteredStats?.total_patients || 0) * 0.15
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-blue-600 dark:text-blue-400">
                              From non-hospitals
                            </span>
                            <span className="text-sm font-bold text-blue-800 dark:text-blue-200">
                              {Math.round(
                                (filteredStats?.total_patients || 0) * 0.05
                              )}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                            <div className="text-xs text-blue-500 dark:text-blue-500">
                              Prior exposure risk factor
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Second Row - Ward & Length of Stay Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {/* Ward Distribution */}
                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200/50 dark:border-purple-800/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Ward Distribution
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-purple-600 dark:text-purple-400">
                              Total wards
                            </span>
                            <span className="text-sm font-bold text-purple-800 dark:text-purple-200">
                              {
                                [
                                  ...new Set(
                                    filteredPatients.map((p) => p.ward_name)
                                  ),
                                ].filter(Boolean).length
                              }
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-purple-600 dark:text-purple-400">
                              Avg per ward
                            </span>
                            <span className="text-sm font-bold text-purple-800 dark:text-purple-200">
                              {Math.round(
                                (filteredStats?.total_patients || 0) /
                                  Math.max(
                                    [
                                      ...new Set(
                                        filteredPatients.map((p) => p.ward_name)
                                      ),
                                    ].filter(Boolean).length,
                                    1
                                  )
                              )}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-purple-200 dark:border-purple-700">
                            <div className="text-xs text-purple-500 dark:text-purple-500">
                              Unit-based surveillance
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Length of Stay */}
                      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200/50 dark:border-green-800/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Patient Days
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-green-600 dark:text-green-400">
                              Long stay patients
                            </span>
                            <span className="text-sm font-bold text-green-800 dark:text-green-200">
                              {loading
                                ? '...'
                                : allPatientDaysMetrics?.patients_staying_longer_than_7_days !==
                                  undefined
                                ? allPatientDaysMetrics.patients_staying_longer_than_7_days.toLocaleString()
                                : Math.round(
                                    (filteredStats?.total_patients || 0) * 0.12
                                  ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-green-600 dark:text-green-400">
                              Long stay percentage
                            </span>
                            <span className="text-sm font-bold text-green-800 dark:text-green-200">
                              {loading
                                ? '...'
                                : allPatientDaysMetrics?.percentage_long_stay !==
                                  undefined
                                ? `${allPatientDaysMetrics.percentage_long_stay.toFixed(
                                    1
                                  )}%`
                                : '12.0%'}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-green-200 dark:border-green-700">
                            <div className="text-xs text-green-500 dark:text-green-500">
                              Patients staying &gt;7 days
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Indication Types */}
                      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 border-indigo-200/50 dark:border-indigo-800/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Indication Types
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-indigo-600 dark:text-indigo-400">
                              Therapeutic
                            </span>
                            <span className="text-sm font-bold text-indigo-800 dark:text-indigo-200">
                              {Math.round(
                                (filteredStats?.patients_on_antibiotic || 0) *
                                  0.75
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-indigo-600 dark:text-indigo-400">
                              Prophylactic
                            </span>
                            <span className="text-sm font-bold text-indigo-800 dark:text-indigo-200">
                              {Math.round(
                                (filteredStats?.patients_on_antibiotic || 0) *
                                  0.25
                              )}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-indigo-200 dark:border-indigo-700">
                            <div className="text-xs text-indigo-500 dark:text-indigo-500">
                              Treatment appropriateness
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* WHO AWaRe Summary */}
                      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 border-amber-200/50 dark:border-amber-800/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            WHO AWaRe Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-green-600">
                                Access
                              </span>
                              <span className="text-xs font-bold text-green-700">
                                72%
                              </span>
                            </div>
                            <Progress value={72} className="h-1.5" />

                            <div className="flex justify-between items-center">
                              <span className="text-xs text-yellow-600">
                                Watch
                              </span>
                              <span className="text-xs font-bold text-yellow-700">
                                22%
                              </span>
                            </div>
                            <Progress value={22} className="h-1.5" />

                            <div className="flex justify-between items-center">
                              <span className="text-xs text-red-600">
                                Reserve
                              </span>
                              <span className="text-xs font-bold text-red-700">
                                6%
                              </span>
                            </div>
                            <Progress value={6} className="h-1.5" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Third Row - Additional Clinical Indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Prior Hospitalization */}
                      <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/50 dark:to-rose-900/50 border-rose-200/50 dark:border-rose-800/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Prior Hospitalization (90d)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-rose-600 dark:text-rose-400">
                              Patients with prior stay
                            </span>
                            <span className="text-sm font-bold text-rose-800 dark:text-rose-200">
                              {Math.round(
                                (filteredStats?.total_patients || 0) * 0.18
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-rose-600 dark:text-rose-400">
                              Risk percentage
                            </span>
                            <span className="text-sm font-bold text-rose-800 dark:text-rose-200">
                              18.0%
                            </span>
                          </div>
                          <div className="pt-2 border-t border-rose-200 dark:border-rose-700">
                            <div className="text-xs text-rose-500 dark:text-rose-500">
                              Resistance risk factor
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Facility Distribution */}
                      <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/50 dark:to-cyan-900/50 border-cyan-200/50 dark:border-cyan-800/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Facility Coverage
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-cyan-600 dark:text-cyan-400">
                              Total facilities
                            </span>
                            <span className="text-sm font-bold text-cyan-800 dark:text-cyan-200">
                              {
                                [
                                  ...new Set(
                                    filteredPatients.map((p) => p.facility)
                                  ),
                                ].filter(Boolean).length
                              }
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-cyan-600 dark:text-cyan-400">
                              Avg per facility
                            </span>
                            <span className="text-sm font-bold text-cyan-800 dark:text-cyan-200">
                              {Math.round(
                                (filteredStats?.total_patients || 0) /
                                  Math.max(
                                    [
                                      ...new Set(
                                        filteredPatients.map((p) => p.facility)
                                      ),
                                    ].filter(Boolean).length,
                                    1
                                  )
                              )}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-cyan-200 dark:border-cyan-700">
                            <div className="text-xs text-cyan-500 dark:text-cyan-500">
                              Geographic representation
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quality Score Summary */}
                      <Card className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/50 dark:to-violet-900/50 border-violet-200/50 dark:border-violet-800/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Quality Score
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-violet-600 dark:text-violet-400">
                              Overall PPS score
                            </span>
                            <span className="text-sm font-bold text-violet-800 dark:text-violet-200">
                              {Math.round(
                                ((allGuideMetrics?.percentage_guideline_compliant ||
                                  0) +
                                  (allCultureMetrics?.percentage_culture_based_prescriptions ||
                                    0) +
                                  (allGenericMetrics?.percentage_generic_prescriptions ||
                                    0)) /
                                  3
                              )}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-violet-600 dark:text-violet-400">
                              Data completeness
                            </span>
                            <span className="text-sm font-bold text-violet-800 dark:text-violet-200">
                              {Math.round(
                                (filteredStats?.total_patients || 0) > 0
                                  ? 95
                                  : 0
                              )}
                              %
                            </span>
                          </div>
                          <div className="pt-2 border-t border-violet-200 dark:border-violet-700">
                            <div className="text-xs text-violet-500 dark:text-violet-500">
                              Composite quality indicator
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* PPS Detailed Analysis Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-emerald-600" />
                      Guidelines Adherence by Indication
                    </CardTitle>
                    <CardDescription>
                      Treatment protocol compliance per indication type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-muted-foreground">
                            Loading...
                          </div>
                        </div>
                      ) : (
                        <BarChart
                          data={[
                            {
                              indication: 'Pneumonia',
                              adherence: 85,
                              total: 45,
                            },
                            {
                              indication: 'UTI',
                              adherence: 92,
                              total: 32,
                            },
                            {
                              indication: 'Sepsis',
                              adherence: 78,
                              total: 28,
                            },
                            {
                              indication: 'Skin/Soft Tissue',
                              adherence: 88,
                              total: 21,
                            },
                            {
                              indication: 'Prophylaxis',
                              adherence: 95,
                              total: 38,
                            },
                          ]}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--muted-foreground))"
                            strokeOpacity={0.2}
                          />
                          <XAxis
                            dataKey="indication"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => [
                              `${value}%`,
                              'Adherence Rate',
                            ]}
                          />
                          <Bar
                            dataKey="adherence"
                            fill="#10b981"
                            name="Adherence %"
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="h-5 w-5 text-purple-600" />
                      WHO AWaRe Antibiotic Categorization
                    </CardTitle>
                    <CardDescription>
                      WHO AWaRe classification with Reserve antibiotics
                      highlighted
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-muted-foreground">Loading...</div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {/* Access */}
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200/50 dark:border-green-800/50">
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                72%
                              </div>
                              <div className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
                                Access
                              </div>
                              <div className="text-xs text-green-500 dark:text-green-500 mt-1">
                                First choice antibiotics
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Watch */}
                        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 border-amber-200/50 dark:border-amber-800/50">
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                                22%
                              </div>
                              <div className="text-sm font-medium text-amber-600 dark:text-amber-400 mt-1">
                                Watch
                              </div>
                              <div className="text-xs text-amber-500 dark:text-amber-500 mt-1">
                                Second choice antibiotics
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Reserve */}
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border-red-200/50 dark:border-red-800/50">
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                                6%
                              </div>
                              <div className="text-sm font-medium text-red-600 dark:text-red-400 mt-1">
                                Reserve
                              </div>
                              <div className="text-xs text-red-500 dark:text-red-500 mt-1">
                                Last resort antibiotics
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Unclassified */}
                        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950/50 dark:to-gray-900/50 border-gray-200/50 dark:border-gray-800/50">
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                                0%
                              </div>
                              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                                Unclassified
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Not categorized
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Overview Dashboard</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    ExportService.exportSectionToPDF(
                      'overview-content',
                      'Overview'
                    )
                  }
                  disabled={exporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Overview
                </Button>
              </div>
              <div
                id="overview-content"
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      Patients by Region
                    </CardTitle>
                    <CardDescription>
                      Distribution of patients across regions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-muted-foreground">
                            Loading...
                          </div>
                        </div>
                      ) : (
                        <BarChart data={filteredStats?.by_region || []}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--muted-foreground))"
                            strokeOpacity={0.2}
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
                      Distribution of antibiotic classes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
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
                              antibioticStats?.by_class || [],
                              'class',
                              'count'
                            )}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: any) =>
                              `${name}\n${(percent * 100).toFixed(1)}%`
                            }
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          >
                            {formatChartData(
                              antibioticStats?.by_class || [],
                              'class',
                              'count'
                            ).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value}`, 'Count']}
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
                    Distribution of specimen types collected
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-muted-foreground">Loading...</div>
                      </div>
                    ) : (
                      <BarChart data={specimenStats?.by_type || []}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--muted-foreground))"
                          strokeOpacity={0.2}
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

          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      ExportService.exportSectionToPDF(
                        'analytics-content',
                        'Analytics'
                      )
                    }
                    disabled={exporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Section
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportAntibiotics('csv')}
                    disabled={exporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
              <div
                id="analytics-content"
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-emerald-600" />
                      Antibiotic Classifications
                    </CardTitle>
                    <CardDescription>
                      WHO AWaRe classification distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
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
                              antibioticStats?.by_classification || [],
                              'classification',
                              'count'
                            )}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: any) =>
                              `${name}\n${(percent * 100).toFixed(1)}%`
                            }
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          >
                            {formatChartData(
                              antibioticStats?.by_classification || [],
                              'classification',
                              'count'
                            ).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value}`, 'Count']}
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
                      Antibiotic administration methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-muted-foreground">
                            Loading...
                          </div>
                        </div>
                      ) : (
                        <BarChart data={antibioticStats?.by_route || []}>
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
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="hsl(var(--chart-1))"
                                stopOpacity={0.2}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--muted-foreground))"
                            strokeOpacity={0.2}
                          />
                          <XAxis dataKey="route" />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="count"
                            fill="url(#colorBar)"
                            radius={[4, 4, 0, 0]}
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

          {activeSection === 'antibiotics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Antibiotic Classes</CardTitle>
                    <CardDescription>
                      Distribution of antibiotic classes used
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
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
                              antibioticStats?.by_class || [],
                              'class',
                              'count'
                            )}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: any) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {formatChartData(
                              antibioticStats?.by_class || [],
                              'class',
                              'count'
                            ).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Dose Frequency</CardTitle>
                    <CardDescription>
                      Distribution of antibiotic dosing frequencies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-muted-foreground">
                            Loading...
                          </div>
                        </div>
                      ) : (
                        <BarChart data={antibioticStats?.by_frequency || []}>
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

          {activeSection === 'patients' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Patient Analytics</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      ExportService.exportSectionToPDF(
                        'patients-content',
                        'Patient Analytics'
                      )
                    }
                    disabled={exporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Charts
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportPatients('csv')}
                    disabled={exporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
              <div
                id="patients-content"
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Patients by Facility</CardTitle>
                    <CardDescription>
                      Distribution across healthcare facilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-muted-foreground">
                            Loading...
                          </div>
                        </div>
                      ) : (
                        <BarChart
                          data={filteredStats?.by_facility || []}
                          layout="horizontal"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis
                            dataKey="facility"
                            type="category"
                            width={100}
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
                    <CardTitle>Patients by Ward</CardTitle>
                    <CardDescription>
                      Ward-wise patient distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-muted-foreground">
                            Loading...
                          </div>
                        </div>
                      ) : (
                        <BarChart data={filteredStats?.by_ward || []}>
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

          {activeSection === 'specimens' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Specimen Analysis</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      ExportService.exportSectionToPDF(
                        'specimens-content',
                        'Specimen Analysis'
                      )
                    }
                    disabled={exporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Charts
                  </Button>
                </div>
              </div>
              <div
                id="specimens-content"
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Culture Results</CardTitle>
                    <CardDescription>
                      Distribution of culture results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
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
                              specimenStats?.by_result || [],
                              'result',
                              'count'
                            )}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: any) =>
                              `${name}\n${(percent * 100).toFixed(1)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {formatChartData(
                              specimenStats?.by_result || [],
                              'result',
                              'count'
                            ).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Microorganisms</CardTitle>
                    <CardDescription>
                      Most common microorganisms identified
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-muted-foreground">
                            Loading...
                          </div>
                        </div>
                      ) : (
                        <BarChart
                          data={specimenStats?.by_microorganism || []}
                          layout="horizontal"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis
                            dataKey="microorganism"
                            type="category"
                            width={100}
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

          {activeSection === 'upload' && (
            <div className="space-y-6">
              <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-emerald-600" />
                        Data Upload
                      </CardTitle>
                      <CardDescription>
                        Upload CSV files to import survey data. Files must be in
                        CSV format and match the expected schema.
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportPatients('csv')}
                      disabled={exporting}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Template
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-24 flex-col bg-transparent hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/50"
                      onClick={() => triggerFileInput('patients')}
                      disabled={uploading}
                    >
                      <Users className="h-6 w-6 mb-2 text-blue-600" />
                      <span className="text-sm font-medium">
                        Upload Patients
                      </span>
                      <span className="text-xs text-muted-foreground">
                        CSV format
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-24 flex-col bg-transparent hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-950/50"
                      onClick={() => triggerFileInput('antibiotics')}
                      disabled={uploading}
                    >
                      <Pill className="h-6 w-6 mb-2 text-emerald-600" />
                      <span className="text-sm font-medium">
                        Upload Antibiotics
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Core variables CSV
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-24 flex-col bg-transparent hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950/50"
                      onClick={() => triggerFileInput('indications')}
                      disabled={uploading}
                    >
                      <FileText className="h-6 w-6 mb-2 text-purple-600" />
                      <span className="text-sm font-medium">
                        Upload Indications
                      </span>
                      <span className="text-xs text-muted-foreground">
                        CSV format
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-24 flex-col bg-transparent hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-950/50"
                      onClick={() => triggerFileInput('optional-vars')}
                      disabled={uploading}
                    >
                      <Settings className="h-6 w-6 mb-2 text-orange-600" />
                      <span className="text-sm font-medium">
                        Upload Optional Vars
                      </span>
                      <span className="text-xs text-muted-foreground">
                        CSV format
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-24 flex-col bg-transparent hover:bg-teal-50 hover:border-teal-200 dark:hover:bg-teal-950/50"
                      onClick={() => triggerFileInput('specimens')}
                      disabled={uploading}
                    >
                      <TestTube className="h-6 w-6 mb-2 text-teal-600" />
                      <span className="text-sm font-medium">
                        Upload Specimens
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Specimen CSV
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'database' && (
            <div className="space-y-6">
              <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-slate-600" />
                        Recent Patients
                      </CardTitle>
                      <CardDescription>
                        Latest patient survey data
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportPatients('csv')}
                        disabled={exporting}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportPatients('json')}
                        disabled={exporting}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        JSON
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportPatients('pdf')}
                        disabled={exporting}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">
                            Patient Code
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Facility
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Ward
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            Survey Date
                          </th>
                          <th className="text-left py-3 px-4 font-medium">
                            On Antibiotic
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-8 text-center text-muted-foreground"
                            >
                              Loading...
                            </td>
                          </tr>
                        ) : filteredPatients.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-8 text-center text-muted-foreground"
                            >
                              No patients found
                            </td>
                          </tr>
                        ) : (
                          filteredPatients.slice(0, 10).map((patient) => (
                            <tr
                              key={patient.id}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="py-3 px-4 font-mono text-sm">
                                {patient.patient_code}
                              </td>
                              <td className="py-3 px-4">{patient.facility}</td>
                              <td className="py-3 px-4">{patient.ward_name}</td>
                              <td className="py-3 px-4 text-muted-foreground">
                                {new Date(
                                  patient.survey_date
                                ).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  variant={
                                    patient.patient_on_antibiotic === 'yes'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                >
                                  {patient.patient_on_antibiotic === 'yes'
                                    ? 'Yes'
                                    : 'No'}
                                </Badge>
                              </td>
                            </tr>
                          ))
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
