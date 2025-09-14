// Test utilities for export functionality
// This file can be used to test export functions in development

import { ExportService } from './export-utils';

// Mock data for testing
const mockPatients = [
    {
        id: "1",
        patient_code: "P001",
        facility: "Kampala Hospital",
        ward_name: "ICU",
        patient_on_antibiotic: "yes",
        survey_date: "2024-01-15",
        region: "Central",
        district: "Kampala",
        subcounty: "Central Division",
        ownership: "Public",
        level_of_care: "Tertiary"
    },
    {
        id: "2",
        patient_code: "P002",
        facility: "Mulago Hospital",
        ward_name: "Medical Ward",
        patient_on_antibiotic: "no",
        survey_date: "2024-01-16",
        region: "Central",
        district: "Kampala",
        subcounty: "Kawempe",
        ownership: "Public",
        level_of_care: "Tertiary"
    }
];

const mockAntibioticStats = {
    total_antibiotics: 150,
    by_class: [
        { class: "Penicillins", count: 45 },
        { class: "Cephalosporins", count: 30 },
        { class: "Fluoroquinolones", count: 25 },
        { class: "Macrolides", count: 20 },
        { class: "Others", count: 30 }
    ],
    by_classification: [
        { classification: "Access", count: 108 },
        { classification: "Watch", count: 33 },
        { classification: "Reserve", count: 9 }
    ],
    by_route: [
        { route: "Oral", count: 90 },
        { route: "IV", count: 45 },
        { route: "IM", count: 15 }
    ],
    by_frequency: [
        { frequency: "TID", count: 60 },
        { frequency: "BID", count: 45 },
        { frequency: "QID", count: 30 },
        { frequency: "Once daily", count: 15 }
    ]
};

// Test functions
export const testExportFunctions = {

    // Test CSV export
    async testCSVExport() {
        console.log('Testing CSV export...');
        try {
            ExportService.exportToCSV(mockPatients, 'test_patients');
            console.log('✅ CSV export successful');
        } catch (error) {
            console.error('❌ CSV export failed:', error);
        }
    },

    // Test JSON export
    async testJSONExport() {
        console.log('Testing JSON export...');
        try {
            ExportService.exportToJSON({
                patients: mockPatients,
                stats: mockAntibioticStats,
                exportDate: new Date().toISOString()
            }, 'test_data');
            console.log('✅ JSON export successful');
        } catch (error) {
            console.error('❌ JSON export failed:', error);
        }
    },

    // Test patient data export
    async testPatientDataExport() {
        console.log('Testing patient data export...');
        try {
            await ExportService.exportPatientData(mockPatients, 'csv');
            console.log('✅ Patient data export successful');
        } catch (error) {
            console.error('❌ Patient data export failed:', error);
        }
    },

    // Test antibiotic data export
    async testAntibioticDataExport() {
        console.log('Testing antibiotic data export...');
        try {
            await ExportService.exportAntibioticData([], mockAntibioticStats, 'json');
            console.log('✅ Antibiotic data export successful');
        } catch (error) {
            console.error('❌ Antibiotic data export failed:', error);
        }
    },

    // Test PDF export (will only work in browser with DOM)
    async testPDFExport() {
        console.log('Testing PDF export...');
        if (typeof window === 'undefined') {
            console.log('⚠️ PDF export test skipped (not in browser environment)');
            return;
        }

        try {
            // Create a simple test element
            const testElement = document.createElement('div');
            testElement.id = 'test-content';
            testElement.innerHTML = `
        <h1>Test PDF Export</h1>
        <p>This is a test of the PDF export functionality.</p>
        <div style="background: #f0f0f0; padding: 20px; margin: 10px 0;">
          <h2>Test Chart Area</h2>
          <div style="width: 300px; height: 200px; background: #e0e0e0; display: flex; align-items: center; justify-content: center;">
            Mock Chart
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9f9f9;">
              <th style="border: 1px solid #ddd; padding: 8px;">Patient Code</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Facility</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${mockPatients.map(p => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${p.patient_code}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${p.facility}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${p.patient_on_antibiotic}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

            document.body.appendChild(testElement);

            await ExportService.exportSectionToPDF('test-content', 'Test Export');

            // Clean up
            document.body.removeChild(testElement);

            console.log('✅ PDF export test successful');
        } catch (error) {
            console.error('❌ PDF export test failed:', error);
        }
    },

    // Test dashboard PDF export
    async testDashboardPDFExport() {
        console.log('Testing dashboard PDF export...');
        if (typeof window === 'undefined') {
            console.log('⚠️ Dashboard PDF export test skipped (not in browser environment)');
            return;
        }

        try {
            await ExportService.exportDashboardToPDF({
                filename: 'test_dashboard',
                orientation: 'landscape'
            });
            console.log('✅ Dashboard PDF export test successful');
        } catch (error) {
            console.error('❌ Dashboard PDF export test failed:', error);
        }
    },

    // Run all tests
    async runAllTests() {
        console.log('🚀 Running all export tests...\n');

        await this.testCSVExport();
        await this.testJSONExport();
        await this.testPatientDataExport();
        await this.testAntibioticDataExport();
        await this.testPDFExport();
        await this.testDashboardPDFExport();

        console.log('\n✅ All export tests completed!');
    }
};

// Auto-run tests in development (optional)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Uncomment the next line to auto-run tests when this file is imported
    // testExportFunctions.runAllTests();
}

export default testExportFunctions;
