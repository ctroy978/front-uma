// src/stores/reports.ts
import { defineStore } from 'pinia';
import api from '@/utils/axios';

// Types
export interface CategoryPerformance {
  category: string;
  score: number;
  benchmark: number;
}

export interface ReportAnalysis {
  readingLevelAnalysis: string;
  textSpecificInsights: string;
  recommendedActivities: string[];
}

export interface CumulativeReportAnalysis {
  progressionAnalysis: string;
  textPerformanceInsights: string;
  developmentRecommendations: string[];
  teachingStrategies: string[];
  readingLevelAnalysis: string;  // Added to match the structure in SingleReport
  textSpecificInsights: string;  // Added to match the structure in SingleReport
  recommendedActivities: string[]; // Added to match the structure in SingleReport
}

export interface SingleReport {
  id: string;
  studentId: string;
  studentName: string;
  textTitle: string;
  textType: string;
  gradeLevel: number;
  completionDate: string;
  duration: number; // in seconds
  overallScore: number;
  totalQuestions: number;
  correctAnswers: number;
  categoryPerformance: CategoryPerformance[];
  analysis: ReportAnalysis;
}

export interface ProgressData {
  date: string;
  score: number;
  textType: string;
}

export interface CategoryTrend {
  category: string;
  dates: string[];
  scores: number[];
}

export interface CumulativeReport {
  id: string;
  studentId: string;
  studentName: string;
  gradeLevel: number;
  startDate: string;
  endDate: string;
  testsCount: number;
  textsCount: number;
  daysCovered: number;
  averageScore: number;
  growth: number;
  progressionData: ProgressData[];
  categoryTrends: CategoryTrend[];
  analysis: CumulativeReportAnalysis;
}

export interface ReportListItem {
  id: string;
  type: 'single' | 'cumulative';
  studentId: string;
  studentName: string;
  gradeLevel: number;
  textTitle?: string;
  textType?: string;
  reportCount?: number;
  dateRange?: number;
  date: string;
  score: number;
}

// State interface
interface ReportsState {
  reports: ReportListItem[];
  currentSingleReport: SingleReport | null;
  currentCumulativeReport: CumulativeReport | null;
  isLoading: boolean;
  error: string | null;
}

export const useReportsStore = defineStore('reports', {
  state: (): ReportsState => ({
    reports: [],
    currentSingleReport: null,
    currentCumulativeReport: null,
    isLoading: false,
    error: null
  }),

  getters: {
    // Get unique students from reports
    uniqueStudents: (state) => {
      const students = state.reports.reduce((acc: { id: string, name: string }[], report) => {
        if (!acc.some(s => s.id === report.studentId)) {
          acc.push({
            id: report.studentId,
            name: report.studentName
          });
        }
        return acc;
      }, []);
      
      return students.sort((a, b) => a.name.localeCompare(b.name));
    },

    // Count of reports by type
    singleReportsCount: (state) => 
      state.reports.filter(report => report.type === 'single').length,
    
    cumulativeReportsCount: (state) => 
      state.reports.filter(report => report.type === 'cumulative').length
  },

  actions: {
    async fetchReports() {
      this.isLoading = true;
      this.error = null;

      try {
        // Real API call to fetch all reports
        const response = await api.get('/teacher/reports');
        this.reports = response.data.map((item: any) => ({
          id: item.id,
          type: item.report_type === 'single_test' ? 'single' : 'cumulative',
          studentId: item.student_id,
          studentName: item.student_name,
          gradeLevel: item.grade_level || 0,
          textTitle: item.text_title,
          textType: item.text_type,
          reportCount: item.tests_count,
          dateRange: item.days_covered,
          date: item.date || item.completed_at || item.created_at,
          score: item.overall_score || 0
        }));
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch reports';
        console.error('Error fetching reports:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchSingleReport(studentId: string, reportId: string) {
      this.isLoading = true;
      this.error = null;
      this.currentSingleReport = null;

      try {
        // Real API call to fetch single report
        const response = await api.get(`/teacher/reports/student/${studentId}/report/${reportId}`);
        
        // Get graph data for visualization
        const graphResponse = await api.get(
          `/teacher/reports/student/${studentId}/report/${reportId}/graph-data`
        );
        
        const reportData = response.data;
        const graphData = graphResponse.data;
        
        // Format category performance data
        const categoryPerformance = graphData.categories.map((cat: any) => ({
          category: this.formatCategoryName(cat.category),
          score: cat.score,
          benchmark: 75 // Default benchmark if not provided by API
        }));
        
        this.currentSingleReport = {
          id: reportId,
          studentId,
          studentName: reportData.student_name,
          textTitle: reportData.text_title,
          textType: graphData.text_metadata?.type || '',
          gradeLevel: reportData.text_grade_level || 0,
          completionDate: reportData.completion_date,
          duration: 0, // Not provided by API
          overallScore: reportData.overall_score,
          totalQuestions: reportData.total_questions || 0,
          correctAnswers: reportData.correct_answers || 0,
          categoryPerformance,
          analysis: {
            readingLevelAnalysis: reportData.analysis.reading_level_analysis || '',
            textSpecificInsights: reportData.analysis.text_specific_insights || '',
            recommendedActivities: reportData.analysis.recommended_activities || []
          }
        };
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch report';
        console.error('Error fetching single report:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCumulativeReport(studentId: string, reportId?: string) {
      this.isLoading = true;
      this.error = null;
      this.currentCumulativeReport = null;

      try {
        // Real API call to fetch cumulative report
        const reportResponse = await api.get(`/teacher/reports/student/${studentId}/cumulative-report`);
        
        // Check if we have an error response (not enough data)
        if (reportResponse.data.error) {
          this.error = reportResponse.data.error;
          return;
        }
        
        // Get the graph data separately
        const graphDataResponse = await api.get(
          `/teacher/reports/student/${studentId}/cumulative-report/graph-data`
        );
        
        // Combine the data
        const reportData = reportResponse.data;
        const graphData = graphDataResponse.data;
        
        // Map the API response to our store's data structure
        this.currentCumulativeReport = {
          id: reportId || studentId,
          studentId,
          studentName: reportData.student_name,
          gradeLevel: reportData.grade_level || 0,
          startDate: reportData.date_range?.start || '',
          endDate: reportData.date_range?.end || '',
          testsCount: reportData.total_tests || 0,
          textsCount: reportData.texts_count || 0,
          daysCovered: this.calculateDaysCovered(reportData.date_range?.start, reportData.date_range?.end),
          averageScore: reportData.overall_score || 0,
          growth: reportData.growth || 0,
          progressionData: this.formatProgressionData(graphData.progression),
          categoryTrends: this.formatCategoryTrends(graphData.category_trends),
          analysis: {
            progressionAnalysis: reportData.analysis?.progression_analysis || '',
            textPerformanceInsights: reportData.analysis?.text_performance_insights || '',
            developmentRecommendations: 
              Array.isArray(reportData.analysis?.development_recommendations) 
                ? reportData.analysis.development_recommendations 
                : reportData.analysis?.development_recommendations?.split('\n').filter(Boolean) || [],
            teachingStrategies: 
              Array.isArray(reportData.analysis?.teaching_strategies) 
                ? reportData.analysis.teaching_strategies 
                : reportData.analysis?.teaching_strategies?.split('\n').filter(Boolean) || [],
            readingLevelAnalysis: "",  // Not used in cumulative but needed for type compatibility
            textSpecificInsights: "",  // Not used in cumulative but needed for type compatibility
            recommendedActivities: [], // Not used in cumulative but needed for type compatibility
          }
        };
        
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch cumulative report';
        console.error('Error fetching cumulative report:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    // Helper methods
    formatProgressionData(progression: any[] = []): ProgressData[] {
      if (!progression || !Array.isArray(progression)) return [];
      
      return progression.map(item => ({
        date: this.formatDateString(item.date),
        score: item.score,
        textType: item.level || item.text_title || '',
      }));
    },
    
    formatDateString(dateString: string) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    },

    calculateDaysCovered(startDate?: string, endDate?: string) {
      if (!startDate || !endDate) return 0;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
      
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    formatCategoryTrends(categoryTrends: any) {
      const result: CategoryTrend[] = [];
      
      if (!categoryTrends) return result;
      
      // Convert backend format to frontend format
      Object.entries(categoryTrends).forEach(([category, data]: [string, any]) => {
        // Skip empty categories
        if (!data) return;
        
        // Format different API response structures
        let dates: string[] = [];
        let scores: number[] = [];
        
        if (Array.isArray(data)) {
          // Handle array format
          scores = data;
          dates = Array(data.length).fill('').map((_, i) => `Day ${i+1}`);
        } else if (typeof data === 'object') {
          // Handle object format with dates as keys
          dates = Object.keys(data).map(date => this.formatDateString(date));
          scores = Object.values(data) as number[];
        }
        
        result.push({
          category: this.formatCategoryName(category),
          dates,
          scores
        });
      });
      
      return result;
    },

    formatCategoryName(category: string) {
      // Convert snake_case to Title Case
      return category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },

    // Filter reports based on criteria
    filterReports(studentId: string = '', reportType: string = '', dateRange: string = '') {
      let filteredReports = [...this.reports];
      
      // Apply student filter
      if (studentId) {
        filteredReports = filteredReports.filter(report => report.studentId === studentId);
      }
      
      // Apply report type filter
      if (reportType) {
        filteredReports = filteredReports.filter(report => report.type === reportType);
      }
      
      // Apply date range filter
      if (dateRange) {
        const daysAgo = parseInt(dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        
        filteredReports = filteredReports.filter(report => {
          const reportDate = new Date(report.date);
          return reportDate >= cutoffDate;
        });
      }
      
      // Sort by most recent first
      return filteredReports.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    },

    // Clear current reports
    clearCurrentReports() {
      this.currentSingleReport = null;
      this.currentCumulativeReport = null;
    },

    // Reset state
    resetState() {
      this.reports = [];
      this.currentSingleReport = null;
      this.currentCumulativeReport = null;
      this.isLoading = false;
      this.error = null;
    }
  }
});