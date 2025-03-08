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

export interface ReportListItem {
  id: string;
  type: string; // This will be 'single_test' from the API
  studentId: string;
  studentName: string;
  gradeLevel: number;
  textTitle?: string;
  textType?: string;
  date: string;
  score: number;
}

// State interface
interface ReportsState {
  reports: ReportListItem[];
  currentSingleReport: SingleReport | null;
  isLoading: boolean;
  error: string | null;
}

export const useReportsStore = defineStore('reports', {
  state: (): ReportsState => ({
    reports: [],
    currentSingleReport: null,
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
    }
  },

  actions: {
    async fetchReports() {
      this.isLoading = true;
      this.error = null;

      try {
        // API call to fetch all reports
        const response = await api.get('/teacher/reports');
        
        // Filter to only include single test reports
        const filteredReports = response.data.filter((item: any) => 
          item.report_type === 'single_test'
        );
        
        // Map the API response to our store's data structure
        this.reports = filteredReports.map((item: any) => ({
          id: item.id,
          type: item.report_type,
          studentId: item.student_id,
          studentName: item.student_name,
          gradeLevel: item.grade_level || 0,
          textTitle: item.text_title,
          textType: item.text_type,
          date: item.completed_at || item.created_at,
          score: item.overall_score || 0
        }));
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch reports';
        console.error('Error fetching reports:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchSingleReport(studentId: string, reportId: string) {
      this.isLoading = true;
      this.error = null;
      this.currentSingleReport = null;

      try {
        // Fetch the single report data
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
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Filter reports based on criteria
    filterReports(studentId: string = '', reportType: string = '', dateRange: string = '') {
      let filteredReports = [...this.reports];
      
      // Apply student filter
      if (studentId) {
        filteredReports = filteredReports.filter(report => report.studentId === studentId);
      }
      
      // Apply report type filter (only if needed, currently we only have single reports)
      if (reportType && reportType !== 'single') {
        // Currently only supporting 'single' reports, so return empty if anything else requested
        return [];
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

    // Helper method to format category names for display
    formatCategoryName(category: string) {
      // Convert snake_case to Title Case
      return category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },

    // Clear current reports
    clearCurrentReports() {
      this.currentSingleReport = null;
    },

    // Reset state
    resetState() {
      this.reports = [];
      this.currentSingleReport = null;
      this.isLoading = false;
      this.error = null;
    }
  }
});