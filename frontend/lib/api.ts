// API configuration for Point Prevalence Survey backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Types matching backend models
export interface Patient {
    id: string
    submission_date: string
    region: string
    district: string
    subcounty: string
    facility: string
    level_of_care: string
    ownership: string
    ward_name: string
    ward_total_patients: number
    ward_eligible_patients: number
    survey_date: string
    patient_initials: string
    code: string
    rand_num: number
    patient_code: string
    show_code: string
    is_the_patient_an_infant: string
    age_months: number
    age_years: number
    pre_term_birth: string
    gender: string
    weight: number
    weight_birth_kg: number
    admission_date: string
    surgery_since_admission: string
    urinary_catheter: string
    peripheral_vascular_catheter: string
    central_vascular_catheter: string
    intubation: string
    patient_on_antibiotic: string
    patient_number_antibiotics: number
    malaria_status: string
    tuberculosis_status: string
    hiv_status: string
    hiv_on_art: string
    hiv_cd4_count: string
    hiv_viral_load: string
    diabetes: string
    malnutrition_status: string
    hypertension: string
    referred_from: string
    hospitalization_90_days: string
    type_surgery_since_admission: string
    additional_comment: string
    comments: string
    instance_id: string
    submitter_id: string
    submitter_name: string
    attachments_present: string
    attachments_expected: string
    status: string
    review_state: string
    device_id: string
    edits: string
    form_version: string
    antibiotics?: Antibiotic[]
    indications?: Indication[]
    optional_vars?: OptionalVar[]
    specimens?: Specimen[]
}

export interface Antibiotic {
    id: string
    antibiotic_notes: string
    antibiotic_inn_name: string
    other_antibiotic: string
    atc_code: string
    antibiotic_class: string
    antibiotic_aware_classification: string
    antibiotic_written_in_inn: string
    start_date_antibiotic: string
    unit_dose: number
    unit_doses_combination: string
    unit_dose_measure_unit: string
    unit_dose_frequency: string
    administration_route: string
    parent_key: string
}

export interface Indication {
    id: string
    indication_type: string
    surg_proph_duration: string
    surg_proph_site: string
    diagnosis: string
    start_date_treatment: string
    reason_in_notes: string
    culture_sample_taken: string
    parent_key: string
}

export interface OptionalVar {
    id: string
    prescriber_type: string
    intravenous_type: string
    oral_switch: string
    number_missed_doses: number
    missed_doses_reason: string
    guidelines_compliance: string
    treatment_type: string
    parent_key: string
}

export interface Specimen {
    id: string
    specimen_type: string
    culture_result: string
    microorganism: string
    antibiotic_susceptibility_test_results: string
    resistant_phenotype: string
    parent_key: string
}

// API Response types
export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
    }
}

export interface PatientStats {
    total_patients: number
    patients_on_antibiotic: number
    by_region: Array<{ region: string; count: number }>
    by_facility: Array<{ facility: string; count: number }>
    by_ward: Array<{ ward: string; count: number }>
}

export interface AntibioticStats {
    total_antibiotics: number
    by_class: Array<{ class: string; count: number }>
    by_classification: Array<{ classification: string; count: number }>
    by_route: Array<{ route: string; count: number }>
    by_frequency: Array<{ frequency: string; count: number }>
}

export interface SpecimenStats {
    total_specimens: number
    by_type: Array<{ type: string; count: number }>
    by_result: Array<{ result: string; count: number }>
    by_microorganism: Array<{ microorganism: string; count: number }>
    by_resistant_phenotype: Array<{ resistant_phenotype: string; count: number }>
}

export interface AwareStats {
    access: {
        count: number
        description: string
        percentage: number
    }
    reserve: {
        count: number
        description: string
        percentage: number
    }
    total_antibiotics: number
    unclassified: {
        count: number
        description: string
        percentage: number
    }
    watch: {
        count: number
        description: string
        percentage: number
    }
}

// API Functions
export class PPSApi {
    private static baseUrl = API_BASE_URL

    // Health check
    static async healthCheck() {
        const response = await fetch(`${this.baseUrl}/health`)
        return response.json()
    }

    // Patient endpoints
    static async getPatients(params?: {
        region?: string
        district?: string
        facility?: string
        ward?: string
        page?: number
        limit?: number
    }): Promise<PaginatedResponse<Patient>> {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await fetch(`${this.baseUrl}/api/v1/patients?${searchParams}`)
        if (!response.ok) throw new Error('Failed to fetch patients')
        return response.json()
    }

    static async getPatient(id: string): Promise<Patient> {
        const response = await fetch(`${this.baseUrl}/api/v1/patients/${id}`)
        if (!response.ok) throw new Error('Failed to fetch patient')
        return response.json()
    }


    static async getBasicMetric(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/v1/pps/basic-metrics`)
        if (!response.ok) throw new Error('Failed to fetch')

        return response.json()
    }

    static async getCultureMetric(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/v1/pps/culture-metrics`)
        if (!response.ok) throw new Error('Failed to fetch')

        return response.json()
    }

    static async getPatientDaysMetric(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/v1/pps/long-stay-patients`)
        if (!response.ok) throw new Error('Failed to fetch')

        return response.json()
    }

    static async getDiagnosisMetric(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/v1/pps/diagnosis-metrics`)
        if (!response.ok) throw new Error('Failed to fetch')

        return response.json()
    }

    static async getGenericMetric(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/v1/pps/generic-metrics`)
        if (!response.ok) throw new Error('Failed to fetch')

        return response.json()
    }
    static async getGuidelineMetric(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/v1/pps/guideline-metrics`)
        if (!response.ok) throw new Error('Failed to fetch')

        return response.json()
    }

    static async getIndicators(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/v1/pps/indicators`)
        if (!response.ok) throw new Error('Failed to fetch')

        return response.json()
    }


    static async getInjectableMetrics(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/v1/pps/injectable-metrics`)
        if (!response.ok) throw new Error('Failed to fetch')

        return response.json()
    }


    static async getMissedDose(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/v1/pps/missed-dose-metrics`)
        if (!response.ok) throw new Error('Failed to fetch')

        return response.json()
    }

    static async getOralSwitch(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/v1/pps/oral-switch-metrics`)
        if (!response.ok) throw new Error('Failed to fetch')

        return response.json()
    }

    static async getPrescriberMetrics(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/v1/pps/prescriber-metrics`)
        if (!response.ok) throw new Error('Failed to fetch')

        return response.json()
    }

    static async getPatientStats(): Promise<PatientStats> {
        const response = await fetch(`${this.baseUrl}/api/v1/patients/stats`)
        if (!response.ok) throw new Error('Failed to fetch patient stats')
        return response.json()
    }

    // Antibiotic endpoints
    static async getAntibiotics(params?: {
        class?: string
        classification?: string
        patient_id?: string
        page?: number
        limit?: number
    }): Promise<PaginatedResponse<Antibiotic>> {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await fetch(`${this.baseUrl}/api/v1/antibiotics?${searchParams}`)
        if (!response.ok) throw new Error('Failed to fetch antibiotics')
        return response.json()
    }

    static async getAntibioticStats(): Promise<AntibioticStats> {
        const response = await fetch(`${this.baseUrl}/api/v1/antibiotics/stats`)
        if (!response.ok) throw new Error('Failed to fetch antibiotic stats')
        return response.json()
    }

    // Specimen endpoints
    static async getSpecimens(params?: {
        type?: string
        result?: string
        patient_id?: string
        page?: number
        limit?: number
    }): Promise<PaginatedResponse<Specimen>> {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await fetch(`${this.baseUrl}/api/v1/specimens?${searchParams}`)
        if (!response.ok) throw new Error('Failed to fetch specimens')
        return response.json()
    }

    static async getSpecimenStats(): Promise<SpecimenStats> {
        const response = await fetch(`${this.baseUrl}/api/v1/specimens/stats`)
        if (!response.ok) throw new Error('Failed to fetch specimen stats')
        return response.json()
    }

    static async getAwareCategorization(): Promise<AwareStats> {
        const response = await fetch(`${this.baseUrl}/api/v1/pps/aware-categorization`)
        if (!response.ok) throw new Error('Failed to fetch AWaRe categorization')
        return response.json()
    }

    // Upload endpoints
    static async uploadPatients(file: File): Promise<{ message: string }> {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${this.baseUrl}/api/v1/upload/patients`, {
            method: 'POST',
            body: formData,
        })
        if (!response.ok) throw new Error('Failed to upload patients')
        return response.json()
    }

    static async uploadAntibiotics(file: File): Promise<{ message: string }> {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${this.baseUrl}/api/v1/upload/antibiotics`, {
            method: 'POST',
            body: formData,
        })
        if (!response.ok) throw new Error('Failed to upload antibiotics')
        return response.json()
    }

    static async uploadIndications(file: File): Promise<{ message: string }> {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${this.baseUrl}/api/v1/upload/indications`, {
            method: 'POST',
            body: formData,
        })
        if (!response.ok) throw new Error('Failed to upload indications')
        return response.json()
    }

    static async uploadOptionalVars(file: File): Promise<{ message: string }> {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${this.baseUrl}/api/v1/upload/optional-vars`, {
            method: 'POST',
            body: formData,
        })
        if (!response.ok) throw new Error('Failed to upload optional variables')
        return response.json()
    }

    static async uploadSpecimens(file: File): Promise<{ message: string }> {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${this.baseUrl}/api/v1/upload/specimens`, {
            method: 'POST',
            body: formData,
        })
        if (!response.ok) throw new Error('Failed to upload specimens')
        return response.json()
    }
}
