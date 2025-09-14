// @ts-ignore - jsPDF types are not perfectly compatible
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// PDF Export utilities for the PPS Dashboard

export interface ExportOptions {
    filename?: string;
    includeCharts?: boolean;
    includeData?: boolean;
    format?: 'pdf' | 'csv' | 'json';
    orientation?: 'portrait' | 'landscape';
}

export interface DashboardData {
    totalPatients: number;
    patientsOnAntibiotics: number;
    totalAntibiotics: number;
    totalSpecimens: number;
    reportDate: string;
    facilityName?: string;
    filters?: {
        region?: string;
        district?: string;
        facility?: string;
        [key: string]: any;
    };
}

export class ExportService {
    // Generate PDF from dashboard content
    static async exportDashboardToPDF(options: ExportOptions = {}): Promise<void> {
        const {
            filename = `PPS_Dashboard_Report_${new Date().toISOString().split('T')[0]}`,
            orientation = 'landscape'
        } = options;

        console.log('Starting PDF export with options:', options);

        try {
            // Check if we're in browser environment
            if (typeof window === 'undefined' || typeof document === 'undefined') {
                throw new Error('PDF export only works in browser environment');
            }

            console.log('Creating PDF instance...');
            // Create PDF instance
            const pdf = new jsPDF({
                orientation,
                unit: 'mm',
                format: 'a4'
            });

            // Add header
            this.addPDFHeader(pdf);
            console.log('Added PDF header');

            // Get dashboard content with better selector fallback
            let dashboardElement = document.querySelector('[data-dashboard-content]') as HTMLElement;

            if (!dashboardElement) {
                console.warn('Dashboard content not found with data attribute, trying alternative selectors...');
                dashboardElement = document.querySelector('.p-6') as HTMLElement;

                if (!dashboardElement) {
                    dashboardElement = document.querySelector('main') as HTMLElement;
                }

                if (!dashboardElement) {
                    console.warn('No dashboard content found, creating fallback content');
                    return this.createFallbackPDF(pdf, filename);
                }
            }

            console.log('Found dashboard element:', dashboardElement);
            console.log('Element dimensions:', {
                width: dashboardElement.offsetWidth,
                height: dashboardElement.offsetHeight,
                scrollWidth: dashboardElement.scrollWidth,
                scrollHeight: dashboardElement.scrollHeight
            });

            // Ensure element is visible and rendered
            if (dashboardElement.offsetWidth === 0 || dashboardElement.offsetHeight === 0) {
                throw new Error('Dashboard element has no dimensions. Please ensure the content is visible.');
            }

            console.log('Converting to canvas...');

            // Wait for charts to render
            await this.waitForChartsToRender(dashboardElement);

            // Add timeout for canvas conversion with more aggressive filtering
            const canvasPromise = html2canvas(dashboardElement, {
                scale: 0.5, // Even more reduced scale
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: Math.min(dashboardElement.scrollWidth, 800), // Much smaller
                height: Math.min(dashboardElement.scrollHeight, 1200), // Much smaller
                scrollX: 0,
                scrollY: 0,
                foreignObjectRendering: false,
                removeContainer: true,
                imageTimeout: 0, // Don't wait for images
                ignoreElements: (element) => {
                    // Skip problematic elements very aggressively
                    const tagName = element.tagName?.toLowerCase();
                    const classList = element.classList;
                    const parentElement = element.parentElement;

                    // Skip all SVG and chart-related elements
                    if (tagName === 'svg' ||
                        tagName === 'g' ||
                        tagName === 'path' ||
                        tagName === 'circle' ||
                        tagName === 'rect' ||
                        tagName === 'text' ||
                        tagName === 'line' ||
                        tagName === 'iframe' ||
                        tagName === 'video' ||
                        tagName === 'audio' ||
                        tagName === 'embed' ||
                        tagName === 'object' ||
                        tagName === 'canvas') {
                        return true;
                    }

                    // Skip chart containers and related elements
                    if (classList.contains('recharts-wrapper') ||
                        classList.contains('recharts-responsive-container') ||
                        classList.contains('recharts-surface') ||
                        classList.contains('animate-spin') ||
                        classList.contains('export-menu-container') ||
                        parentElement?.classList.contains('recharts-wrapper') ||
                        parentElement?.classList.contains('recharts-responsive-container')) {
                        return true;
                    }

                    // Skip fixed/sticky positioned elements
                    const style = (element as HTMLElement).style;
                    if (style && (style.position === 'fixed' || style.position === 'sticky')) {
                        return true;
                    }

                    return false;
                },
                onclone: (clonedDoc) => {
                    console.log('Document cloned, applying fixes...');

                    // Remove ALL chart-related elements very aggressively
                    const problematicSelectors = [
                        'svg',
                        '.animate-spin',
                        '.export-menu-container',
                        '[style*="position: fixed"]',
                        '[style*="position: sticky"]',
                        '.recharts-wrapper',
                        '.recharts-responsive-container',
                        '.recharts-surface',
                        '[class*="recharts"]',
                        'canvas'
                    ];

                    problematicSelectors.forEach(selector => {
                        const elements = clonedDoc.querySelectorAll(selector);
                        elements.forEach(el => {
                            if (selector.includes('recharts') || selector === 'svg' || selector === 'canvas') {
                                // Replace charts with simple placeholders
                                const placeholder = clonedDoc.createElement('div');
                                const width = (el as HTMLElement).offsetWidth || 300;
                                const height = (el as HTMLElement).offsetHeight || 200;

                                placeholder.style.cssText = `
                                    width: ${width}px;
                                    height: ${height}px;
                                    background: #f8f9fa;
                                    border: 2px dashed #dee2e6;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: #6c757d;
                                    font-size: 16px;
                                    font-weight: 500;
                                    font-family: Arial, sans-serif;
                                `;
                                placeholder.textContent = '📊 Chart Placeholder';

                                if (el.parentNode) {
                                    el.parentNode.replaceChild(placeholder, el);
                                }
                            } else {
                                el.remove();
                            }
                        });
                    });

                    // Fix transforms and positioning
                    const allElements = clonedDoc.querySelectorAll('*');
                    allElements.forEach(el => {
                        const element = el as HTMLElement;
                        if (element.style) {
                            element.style.transform = 'none';
                            element.style.transition = 'none';
                            element.style.animation = 'none';
                            if (element.style.position === 'fixed' || element.style.position === 'sticky') {
                                element.style.position = 'static';
                            }
                        }
                    });

                    // Ensure visibility
                    const hiddenElements = clonedDoc.querySelectorAll('[style*="display: none"]');
                    hiddenElements.forEach(el => {
                        const element = el as HTMLElement;
                        if (!element.closest('.animate-spin') && !element.closest('.export-menu-container')) {
                            element.style.display = 'block';
                        }
                    });
                }
            });

            // Add 10 second timeout for faster fallback
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Canvas conversion timed out after 10 seconds')), 10000);
            });

            const canvas = await Promise.race([canvasPromise, timeoutPromise]) as HTMLCanvasElement;

            console.log('Canvas created:', {
                width: canvas.width,
                height: canvas.height
            });

            if (canvas.width === 0 || canvas.height === 0) {
                throw new Error('Generated canvas has no dimensions');
            }

            // Calculate dimensions
            const imgWidth = 297; // A4 width in mm (landscape)
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const pageHeight = 210; // A4 height in mm (landscape)

            console.log('PDF dimensions:', {
                imgWidth,
                imgHeight,
                pageHeight
            });

            let y = 25; // Start below header
            const imgData = canvas.toDataURL('image/png', 0.8); // Reduced quality for smaller file

            // Add content to PDF
            if (imgHeight <= pageHeight - 35) {
                console.log('Adding single page content...');
                // Single page
                pdf.addImage(imgData, 'PNG', 5, y, imgWidth - 10, imgHeight);
            } else {
                console.log('Adding multi-page content...');
                // Simplified multi-page approach
                const maxHeight = pageHeight - 35;
                const scaledHeight = Math.min(imgHeight, maxHeight);

                pdf.addImage(imgData, 'PNG', 5, y, imgWidth - 10, scaledHeight);

                // If content is too tall, add a note
                if (imgHeight > maxHeight) {
                    pdf.addPage();
                    this.addPDFHeader(pdf, 'Dashboard (Continued)');
                    pdf.setFontSize(12);
                    pdf.text('Note: Content has been scaled to fit page. For full detail, export individual sections.', 20, 40);
                }
            }

            // Add footer
            this.addPDFFooter(pdf);

            console.log('Saving PDF...');
            // Save PDF
            pdf.save(`${filename}.pdf`);
            console.log('PDF export completed successfully');

        } catch (error) {
            console.error('Error exporting PDF:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });

            // Try to create a simplified fallback export
            console.log('Attempting fallback export...');
            try {
                await this.exportDashboardSimple({
                    filename: filename + '_fallback',
                    orientation
                });
                throw new Error('Complex export failed, but a simplified version was created. Check your downloads folder for the fallback PDF.');
            } catch (fallbackError) {
                console.error('Fallback export also failed:', fallbackError);
            }

            // Provide more specific error messages
            if (error instanceof Error) {
                if (error.message.includes('canvas') || error.message.includes('html2canvas')) {
                    throw new Error('Failed to capture dashboard content. The charts may be complex. Please try the "Simple Text PDF" option instead.');
                } else if (error.message.includes('dimensions') || error.message.includes('no dimensions')) {
                    throw new Error('Dashboard content is not properly loaded. Please wait for all data to load and try again.');
                } else if (error.message.includes('memory') || error.message.includes('size') || error.message.includes('too large')) {
                    throw new Error('Dashboard is too large to export. Please try exporting individual sections or use "Simple Text PDF" instead.');
                } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
                    throw new Error('Export took too long to complete. Please try the "Simple Text PDF" option or export individual sections.');
                } else if (error.message.includes('jsPDF') || error.message.includes('PDF')) {
                    throw new Error('PDF generation failed. Please try refreshing the page and using the "Simple Text PDF" option.');
                }
            }

            throw new Error('Failed to export dashboard as PDF. Please try the "Simple Text PDF" option from the export menu.');
        }
    }

    // Export specific section to PDF
    static async exportSectionToPDF(sectionId: string, title: string): Promise<void> {
        console.log(`Exporting section: ${sectionId}`);

        try {
            const element = document.getElementById(sectionId);
            if (!element) {
                throw new Error(`Section with ID '${sectionId}' not found`);
            }

            console.log('Found section element:', element);

            // Ensure element is visible
            if (element.offsetWidth === 0 || element.offsetHeight === 0) {
                throw new Error(`Section '${sectionId}' is not visible or has no dimensions`);
            }

            const pdf = new jsPDF('portrait', 'mm', 'a4');
            this.addPDFHeader(pdf, title);

            console.log('Converting section to canvas...');
            const canvas = await html2canvas(element, {
                scale: 1.5,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: element.scrollWidth,
                height: element.scrollHeight,
                foreignObjectRendering: false
            });

            console.log('Section canvas created:', {
                width: canvas.width,
                height: canvas.height
            });

            if (canvas.width === 0 || canvas.height === 0) {
                throw new Error('Generated canvas has no dimensions');
            }

            const imgWidth = 190;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const maxHeight = 250; // Max height per page

            const imgData = canvas.toDataURL('image/png', 0.9);

            if (imgHeight <= maxHeight) {
                // Single page
                pdf.addImage(imgData, 'PNG', 10, 30, imgWidth, imgHeight);
            } else {
                // Scale to fit
                const scaledHeight = Math.min(imgHeight, maxHeight);
                pdf.addImage(imgData, 'PNG', 10, 30, imgWidth, scaledHeight);

                if (imgHeight > maxHeight) {
                    pdf.addPage();
                    this.addPDFHeader(pdf, `${title} (Continued)`);
                    pdf.setFontSize(10);
                    pdf.text('Note: Content has been scaled to fit page dimensions.', 10, 40);
                }
            }

            this.addPDFFooter(pdf);

            const filename = `PPS_${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            console.log('Saving section PDF:', filename);
            pdf.save(filename);

        } catch (error) {
            console.error('Error exporting section PDF:', error);
            throw new Error(`Failed to export ${title} section: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Export data to CSV
    static exportToCSV(data: any[], filename: string): void {
        if (!data || data.length === 0) {
            throw new Error('No data to export');
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' && value.includes(',')
                        ? `"${value}"`
                        : value;
                }).join(',')
            )
        ].join('\n');

        this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    }

    // Export data to JSON
    static exportToJSON(data: any, filename: string): void {
        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
    }

    // Export filtered patient data
    static async exportPatientData(
        patients: any[],
        format: 'csv' | 'json' | 'pdf' = 'csv',
        filters?: any
    ): Promise<void> {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `PPS_Patient_Data_${timestamp}`;

        if (format === 'csv') {
            this.exportToCSV(patients, filename);
        } else if (format === 'json') {
            this.exportToJSON({ patients, filters, exportDate: new Date().toISOString() }, filename);
        } else if (format === 'pdf') {
            await this.exportPatientDataToPDF(patients, filters);
        }
    }

    // Export antibiotic data
    static async exportAntibioticData(
        antibiotics: any[],
        stats: any,
        format: 'csv' | 'json' | 'pdf' = 'csv'
    ): Promise<void> {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `PPS_Antibiotic_Data_${timestamp}`;

        if (format === 'csv') {
            this.exportToCSV(antibiotics, filename);
        } else if (format === 'json') {
            this.exportToJSON({
                antibiotics,
                statistics: stats,
                exportDate: new Date().toISOString()
            }, filename);
        }
    }

    // Wait for charts to render properly
    private static async waitForChartsToRender(element: HTMLElement): Promise<void> {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 20;

            const checkCharts = () => {
                const charts = element.querySelectorAll('.recharts-wrapper, .recharts-responsive-container');
                const loadedCharts = Array.from(charts).filter(chart => {
                    const svg = chart.querySelector('svg');
                    return svg && svg.children.length > 0;
                });

                attempts++;

                if (loadedCharts.length === charts.length || attempts >= maxAttempts) {
                    console.log(`Charts loaded: ${loadedCharts.length}/${charts.length} after ${attempts} attempts`);
                    resolve();
                } else {
                    setTimeout(checkCharts, 250);
                }
            };

            checkCharts();
        });
    }

    // Private helper methods
    private static addPDFHeader(pdf: jsPDF, title: string = 'Point Prevalence Survey Dashboard'): void {
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, 20, 20);

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

        // Add line separator
        pdf.setLineWidth(0.5);
        pdf.line(20, 35, 277, 35);
    }

    private static addPDFFooter(pdf: jsPDF): void {
        const pageCount = pdf.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(
                `Page ${i} of ${pageCount} | Point Prevalence Survey System`,
                20,
                200
            );
        }
    }

    private static async exportVisibleContent(pdf: jsPDF, filename: string): Promise<void> {
        // Fallback: export visible viewport
        const canvas = await html2canvas(document.body, {
            scale: 1,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const imgWidth = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const imgData = canvas.toDataURL('image/png');

        pdf.addImage(imgData, 'PNG', 0, 20, imgWidth, imgHeight);
        this.addPDFFooter(pdf);
        pdf.save(`${filename}.pdf`);
    }

    private static async exportPatientDataToPDF(patients: any[], filters?: any): Promise<void> {
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        this.addPDFHeader(pdf, 'Patient Data Report');

        // Add filters info if present
        let yPosition = 50;
        if (filters) {
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Applied Filters:', 20, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'all') {
                    pdf.text(`${key}: ${value}`, 20, yPosition);
                    yPosition += 8;
                }
            });
            yPosition += 10;
        }

        // Add patient summary
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Total Patients: ${patients.length}`, 20, yPosition);
        yPosition += 15;

        // Add table headers
        const headers = ['Patient Code', 'Facility', 'Ward', 'On Antibiotic', 'Survey Date'];
        const columnWidths = [50, 80, 60, 40, 50];
        let xPosition = 20;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        headers.forEach((header, index) => {
            pdf.text(header, xPosition, yPosition);
            xPosition += columnWidths[index];
        });

        yPosition += 10;

        // Add patient data (limited to fit on page)
        pdf.setFont('helvetica', 'normal');
        const maxRows = Math.min(patients.length, 20); // Limit to 20 rows per page

        for (let i = 0; i < maxRows; i++) {
            const patient = patients[i];
            xPosition = 20;

            const rowData = [
                patient.patient_code || '',
                patient.facility || '',
                patient.ward_name || '',
                patient.patient_on_antibiotic || '',
                patient.survey_date ? new Date(patient.survey_date).toLocaleDateString() : ''
            ];

            rowData.forEach((data, index) => {
                pdf.text(String(data).substring(0, 15), xPosition, yPosition); // Truncate long text
                xPosition += columnWidths[index];
            });

            yPosition += 8;

            // Add new page if needed
            if (yPosition > 180) {
                pdf.addPage();
                yPosition = 30;
                this.addPDFHeader(pdf, 'Patient Data Report (Continued)');
            }
        }

        if (patients.length > maxRows) {
            pdf.text(`... and ${patients.length - maxRows} more patients`, 20, yPosition + 10);
        }

        this.addPDFFooter(pdf);
        pdf.save(`PPS_Patient_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    // Alternative simplified export for problematic dashboards
    static async exportDashboardSimple(options: ExportOptions = {}): Promise<void> {
        const {
            filename = `PPS_Dashboard_Simple_${new Date().toISOString().split('T')[0]}`,
            orientation = 'landscape'
        } = options;

        console.log('Starting simple PDF export...');

        try {
            const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
            this.addPDFHeader(pdf, 'Point Prevalence Survey Dashboard Summary');

            let yPosition = 45;
            const lineHeight = 8;
            const pageWidth = orientation === 'landscape' ? 297 : 210;
            const margin = 20;

            // Export text-based summary instead of visual capture
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Dashboard Summary Report', margin, yPosition);
            yPosition += lineHeight * 2;

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');

            // Get basic stats from the page with better selectors
            const dashboardElement = document.querySelector('[data-dashboard-content]');

            if (dashboardElement) {
                // Extract key metrics
                const statsCards = dashboardElement.querySelectorAll('.text-3xl, .text-2xl');
                const cardTitles = dashboardElement.querySelectorAll('.text-sm.font-medium, .text-xs.font-medium');

                if (statsCards.length > 0) {
                    pdf.setFontSize(14);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text('Key Metrics:', margin, yPosition);
                    yPosition += lineHeight * 1.5;

                    pdf.setFontSize(11);
                    pdf.setFont('helvetica', 'normal');

                    for (let i = 0; i < Math.min(statsCards.length, 8); i++) { // Limit to 8 metrics
                        const value = statsCards[i]?.textContent?.trim() || 'N/A';
                        const title = cardTitles[i]?.textContent?.trim() || `Metric ${i + 1}`;

                        // Clean up the text
                        const cleanTitle = title.replace(/[\r\n\t]/g, ' ').substring(0, 40);
                        const cleanValue = value.replace(/[\r\n\t]/g, ' ').substring(0, 20);

                        pdf.text(`• ${cleanTitle}: ${cleanValue}`, margin + 5, yPosition);
                        yPosition += lineHeight;

                        // Check if we need a new page
                        if (yPosition > (orientation === 'landscape' ? 180 : 250)) {
                            pdf.addPage();
                            this.addPDFHeader(pdf, 'Dashboard Summary (Continued)');
                            yPosition = 45;
                        }
                    }
                }

                // Add filter information
                yPosition += lineHeight;
                const activeFilters = this.getActiveFilters();
                if (activeFilters.length > 0) {
                    pdf.setFontSize(14);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text('Active Filters:', margin, yPosition);
                    yPosition += lineHeight;

                    pdf.setFontSize(11);
                    pdf.setFont('helvetica', 'normal');

                    activeFilters.forEach(filter => {
                        pdf.text(`• ${filter}`, margin + 5, yPosition);
                        yPosition += lineHeight;
                    });
                }

                // Add section information
                yPosition += lineHeight;
                pdf.setFontSize(14);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Available Sections:', margin, yPosition);
                yPosition += lineHeight;

                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'normal');

                const sections = [
                    'Overview - Patient distribution and regional analysis',
                    'Analytics - Antibiotic classifications and administration routes',
                    'Patients - Facility and ward-wise patient analytics',
                    'Antibiotics - Usage patterns and frequency analysis',
                    'Specimens - Culture results and microorganism data'
                ];

                sections.forEach(section => {
                    pdf.text(`• ${section}`, margin + 5, yPosition);
                    yPosition += lineHeight;
                });

            } else {
                pdf.text('Dashboard content not found. Please ensure the page is fully loaded.', margin, yPosition);
                yPosition += lineHeight * 2;
            }

            // Add export note
            yPosition += lineHeight;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'italic');
            pdf.text('Note: This is a simplified text-based export without charts.', margin, yPosition);
            pdf.text('For full visual charts, please export individual sections or try again once', margin, yPosition + lineHeight);
            pdf.text('all dashboard content has loaded completely.', margin, yPosition + lineHeight * 2);

            this.addPDFFooter(pdf);
            pdf.save(`${filename}.pdf`);

            console.log('Simple PDF export completed');
        } catch (error) {
            console.error('Simple export failed:', error);
            throw new Error(`Failed to create simplified PDF export: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Helper method to get active filters
    private static getActiveFilters(): string[] {
        const filters: string[] = [];

        try {
            const filterBadges = document.querySelectorAll('[data-dashboard-content] .bg-blue-100, [data-dashboard-content] .bg-green-100, [data-dashboard-content] .bg-yellow-100, [data-dashboard-content] .bg-purple-100');

            filterBadges.forEach(badge => {
                const text = badge.textContent?.trim();
                if (text && text.length > 0) {
                    filters.push(text);
                }
            });
        } catch (error) {
            console.warn('Could not extract filter information:', error);
        }

        return filters;
    }

    private static createFallbackPDF(pdf: jsPDF, filename: string): void {
        console.log('Creating fallback PDF...');

        // Add a simple fallback content
        pdf.setFontSize(16);
        pdf.text('Point Prevalence Survey Dashboard Export', 20, 40);

        pdf.setFontSize(12);
        pdf.text('Export Date: ' + new Date().toLocaleDateString(), 20, 55);
        pdf.text('Unable to capture dashboard content automatically.', 20, 70);
        pdf.text('Please try the following:', 20, 85);
        pdf.text('1. Ensure all dashboard content has loaded completely', 25, 100);
        pdf.text('2. Try exporting individual sections instead', 25, 115);
        pdf.text('3. Refresh the page and try again', 25, 130);
        pdf.text('4. Try the simplified export option', 25, 145);

        this.addPDFFooter(pdf);
        pdf.save(`${filename}.pdf`);
    }

    private static downloadFile(content: string, filename: string, mimeType: string): void {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Debug function to check export setup
export const debugExportSetup = () => {
    console.log('=== Export Setup Debug ===');

    // Check if libraries are loaded
    try {
        console.log('✅ jsPDF available:', typeof jsPDF !== 'undefined');
        console.log('✅ html2canvas available:', typeof html2canvas !== 'undefined');
    } catch (e) {
        console.error('❌ Export libraries not loaded:', e);
    }

    // Check if dashboard element exists
    const dashboardElement = document.querySelector('[data-dashboard-content]');
    console.log('✅ Dashboard element found:', !!dashboardElement);

    if (dashboardElement) {
        const element = dashboardElement as HTMLElement;
        console.log('Dashboard element details:', {
            tagName: element.tagName,
            width: element.offsetWidth,
            height: element.offsetHeight,
            scrollWidth: element.scrollWidth,
            scrollHeight: element.scrollHeight,
            visible: element.offsetWidth > 0 && element.offsetHeight > 0
        });
    }

    // Check section elements
    const sections = ['overview-content', 'analytics-content', 'patients-content', 'specimens-content'];
    sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        console.log(`Section ${sectionId}:`, !!element);
    });

    console.log('=== End Debug ===');
};

// Make debug function available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).debugExportSetup = debugExportSetup;
}

// Utility functions for easy use in components
export const exportDashboard = () => ExportService.exportDashboardToPDF();

export const exportSection = (sectionId: string, title: string) =>
    ExportService.exportSectionToPDF(sectionId, title);

export const exportPatients = (patients: any[], format: 'csv' | 'json' | 'pdf' = 'csv', filters?: any) =>
    ExportService.exportPatientData(patients, format, filters);

export const exportAntibiotics = (antibiotics: any[], stats: any, format: 'csv' | 'json' = 'csv') =>
    ExportService.exportAntibioticData(antibiotics, stats, format);
