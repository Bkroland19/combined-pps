'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/sidebar';
import {
  Activity,
  Users,
  Database,
  Shield,
  FileText,
  Globe,
  Menu,
  BarChart3,
  Mail,
  Building2,
  BookOpen,
  ExternalLink,
} from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('about');

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    if (section !== 'about') {
      router.push('/');
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Sidebar
        sidebarOpen={sidebarOpen}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      <div
        className={`fixed top-16 bottom-0 right-0 transition-all duration-300 ${
          sidebarOpen ? 'left-64' : 'left-0'
        } overflow-y-auto`}
      >
        <div className="pb-8 px-2">
          {/* Mobile Menu Button */}
          <div className="pt-4 pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="mx-2">
            {/* Header */}
            <div className="text-center mb-12 mt-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                About PPS Dashboard
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                A comprehensive data management and analytics platform for
                monitoring antimicrobial use and resistance in healthcare
                facilities across Uganda
              </p>
            </div>

            {/* What is PPS Section */}
            <Card className="mb-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  1. What is a Point Prevalence Survey?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-slate-700 dark:text-slate-300 list-disc list-inside">
                  <li>
                    A Point Prevalence Survey (PPS) is a standardized,
                    repeatable method used worldwide to take a "snapshot" of
                    antibiotic use and healthcare-associated infections in
                    hospitals on a specific day.
                  </li>
                  <li>
                    In Uganda, PPS helps monitor how antibiotics are prescribed,
                    identify areas for improvement, and track change caused by
                    stewardship interventions.
                  </li>
                  <li>
                    Data is collected periodically from participating health
                    facilities using WHO methodology.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Key Indicators Section */}
            <Card className="mb-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  2. Key Indicators on This Dashboard
                </CardTitle>
                <CardDescription>
                  Understanding what each metric measures and why it matters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left p-3 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50">
                          Indicator
                        </th>
                        <th className="text-left p-3 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50">
                          What It Measures
                        </th>
                        <th className="text-left p-3 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50">
                          Numerator
                        </th>
                        <th className="text-left p-3 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50">
                          Denominator
                        </th>
                        <th className="text-left p-3 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50">
                          Why It Matters
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                          % Patients on Antibiotics
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Proportion of inpatients receiving ≥1 antibiotic on
                          the survey day
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Patients receiving antibiotics
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          All surveyed patients (all admitted patients)
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          High values may signal overuse
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                          Average Antibiotics per Patient
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Average number of different antibiotics per patient
                          receiving them
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Total antibiotic prescriptions
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Patients receiving antibiotics
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          &gt;1 often indicates broad/polypharmacy
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                          Guideline Adherence
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          % of prescriptions following Uganda Clinical
                          Guidelines or local protocols
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Prescriptions compliant with guidelines
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          All antibiotic prescriptions
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Low adherence = opportunity for training
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                          Diagnosis Documented
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          % of antibiotic uses with a recorded reason/indication
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Antibiotics with documented indication
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          All antibiotic prescriptions
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Low percentages indicate missing notes reduce quality
                          of care
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                          Culture-Guided (Targeted) Therapy
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          % of antibiotics prescribed based on lab culture &amp;
                          sensitivity results
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Antibiotics adjusted by culture results
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Relevant prescriptions (e.g., treated infections)
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Improves effectiveness, reduces resistance
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                          WHO AWaRe Classification
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Breakdown of antibiotics into Access, Watch, Reserve
                          groups
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Antibiotics in each category
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Total antibiotics prescribed
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          High "Watch/Reserve" = higher resistance risk
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                          Surgical Prophylaxis &gt;24h
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          % of surgical antibiotic prophylaxis continued beyond
                          24 hours
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Prolonged prophylaxis cases
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          All surgical prophylaxis cases
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                          Prolonged use drives resistance unnecessarily
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Data Sources & Coverage Section */}
            <Card className="mb-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  3. Data Sources &amp; Coverage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700 dark:text-slate-300">
                  The data presented in this dashboard comes from repeated Point
                  Prevalence Surveys on antimicrobial use conducted in Ugandan
                  health facilities. Surveys are carried out two times a year in
                  participating health facilities across different regions of
                  Uganda.
                </p>
                <ul className="space-y-3 text-slate-700 dark:text-slate-300 list-disc list-inside">
                  <li>
                    <strong>Participating facilities:</strong> As of the latest
                    round, over 50 hospitals and health facilities (from
                    regional referral hospitals to lower-level facilities) have
                    contributed data.
                  </li>
                  <li>
                    <strong>Wards surveyed:</strong> Adult medical, adult
                    surgical, paediatric medical, paediatric surgical, intensive
                    care units, and other selected wards.
                  </li>
                  <li>
                    <strong>Survey methodology:</strong> Adapted from the{' '}
                    <a
                      href="https://www.who.int/publications/i/item/WHO-EMP-IAU-2018.01"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      WHO PPS protocol
                      <ExternalLink className="h-3 w-3" />
                    </a>{' '}
                    to the Ugandan context and aligned with Uganda Clinical
                    Guidelines and the WHO AWaRe classification.
                  </li>
                  <li>
                    <strong>Time period covered:</strong> Data from 2024
                    onwards, with the most recent survey dates displayed on the
                    dashboard filters.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* How to Use Section */}
            <Card className="mb-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-teal-600" />
                  4. How to Use This Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                        1
                      </span>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-slate-700 dark:text-slate-300">
                        Use the filters at the top (survey year/round, region,
                        facility level, ward type, etc.) to explore specific
                        subsets of data.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                        2
                      </span>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-slate-700 dark:text-slate-300">
                        Hover over charts and bars for exact values and details.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                        3
                      </span>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-slate-700 dark:text-slate-300">
                        Compare trends over time by selecting multiple survey
                        rounds where available.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                        4
                      </span>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-slate-700 dark:text-slate-300">
                        National-level figures represent the aggregated results
                        from all participating facilities in each survey round.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partners Section */}
            <Card className="mb-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-cyan-600" />
                  5. Partners
                </CardTitle>
                <CardDescription>
                  This dashboard and the national PPS programme are made
                  possible through collaboration between:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Ministry of Health, Uganda */}
                  <div className="flex flex-col items-center p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:shadow-md transition-shadow">
                    <div className="w-24 h-24 mb-3 relative bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <Image
                        src="/Ministry-of-Health-Logo.png"
                        alt="Ministry of Health, Uganda"
                        width={96}
                        height={96}
                        className="object-contain p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div class="text-slate-400 dark:text-slate-600 text-xs text-center p-2">Logo</div>';
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 text-center">
                      Ministry of Health, Uganda
                    </p>
                  </div>

                  {/* National Medical Stores */}
                  <div className="flex flex-col items-center p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:shadow-md transition-shadow">
                    <div className="w-24 h-24 mb-3 relative bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <Image
                        src="/national medical stores logo.png"
                        alt="National Medical Stores"
                        width={96}
                        height={96}
                        className="object-contain p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div class="text-slate-400 dark:text-slate-600 text-xs text-center p-2">Logo</div>';
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 text-center">
                      National Medical Stores
                    </p>
                  </div>

                  {/* The Fleming Fund */}
                  <div className="flex flex-col items-center p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:shadow-md transition-shadow">
                    <div className="w-24 h-24 mb-3 relative bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <Image
                        src="/fleming fund logo.png"
                        alt="The Fleming Fund"
                        width={96}
                        height={96}
                        className="object-contain p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div class="text-slate-400 dark:text-slate-600 text-xs text-center p-2">Logo</div>';
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 text-center">
                      The Fleming Fund (Country Grant)
                    </p>
                  </div>

                  {/* Global Fund */}
                  <div className="flex flex-col items-center p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:shadow-md transition-shadow">
                    <div className="w-24 h-24 mb-3 relative bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <Image
                        src="/the global fund logo.jpg"
                        alt="Global Fund"
                        width={96}
                        height={96}
                        className="object-contain p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div class="text-slate-400 dark:text-slate-600 text-xs text-center p-2">Logo</div>';
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 text-center">
                      Global Fund
                    </p>
                  </div>

                  {/* IDI, Makerere University */}
                  <div className="flex flex-col items-center p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:shadow-md transition-shadow">
                    <div className="w-24 h-24 mb-3 relative bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <Image
                        src="/idi logo.png"
                        alt="Infectious Diseases Institute, Makerere University"
                        width={96}
                        height={96}
                        className="object-contain p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div class="text-slate-400 dark:text-slate-600 text-xs text-center p-2">Logo</div>';
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 text-center">
                      Infectious Diseases Institute (IDI), Makerere University
                    </p>
                  </div>

                  {/* Baylor College */}
                  <div className="flex flex-col items-center p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:shadow-md transition-shadow">
                    <div className="w-24 h-24 mb-3 relative bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <Image
                        src="/baylor college logo.png"
                        alt="Baylor College of Medicine Children's Foundation - Uganda"
                        width={96}
                        height={96}
                        className="object-contain p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div class="text-slate-400 dark:text-slate-600 text-xs text-center p-2">Logo</div>';
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 text-center">
                      Baylor College of Medicine Children&apos;s Foundation –
                      Uganda
                    </p>
                  </div>

                  {/* Participating Health Facilities */}
                  <div className="flex flex-col items-center p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:shadow-md transition-shadow">
                    <div className="w-24 h-24 mb-3 relative bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <Image
                        src="/partners/participating-facilities.png"
                        alt="Participating health facilities across Uganda"
                        width={96}
                        height={96}
                        className="object-contain p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div class="text-slate-400 dark:text-slate-600 text-xs text-center p-2">Logo</div>';
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 text-center">
                      Participating health facilities across Uganda
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Feedback Section */}
            <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-emerald-600" />
                  Contact &amp; Feedback
                </CardTitle>
                <CardDescription>
                  For questions, suggestions, or reports of any issues with the
                  dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-slate-700 dark:text-slate-300">
                  <p>
                    <strong>Philip Waiswa</strong>{' '}
                    <a
                      href="mailto:philipwaiswa@gmail.com"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      philipwaiswa@gmail.com
                    </a>
                  </p>
                  <p>
                    <strong>Harriet Akello</strong>{' '}
                    <a
                      href="mailto:harakello@gmail.com"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      harakello@gmail.com
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
