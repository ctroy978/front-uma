// src/stores/reports.ts
import { defineStore } from 'pinia';
import api from '@/utils/axios';

// Types
export interface CategoryPerformance {
  category: string;
  score: number;
}

export interface ReportAnalysis {
  readingLevelAnalysis: string;
  textSpecificInsights: string;
  recommendedActivities: string[];
}

export interface QuestionDetail {
  id: string;
  category: string;
  difficulty: string;
  question_text: string;
  student_answer: string;
  is_correct: boolean;
  time_spent_seconds: number;
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
  questions?: QuestionDetail[];
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

// Filter parameters interface
export interface ReportFilters {
  studentId?: string;
  reportType?: string;
  dateRange?: string;
  textTitle?: string;
  gradeLevel?: number | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// State interface
interface ReportsState {
  reports: ReportListItem[];
  currentSingleReport: SingleReport | null;
  isLoading: boolean;
  error: string | null;
  availableTexts: { id: string; title: string; gradeLevel: number }[];
}

export const useReportsStore = defineStore('reports', {
  state: (): ReportsState => ({
    reports: [],
    currentSingleReport: null,
    isLoading: false,
    error: null,
    availableTexts: []
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

    // Get unique grade levels from the available texts
    availableGradeLevels: (state) => {
      const gradeLevels = [...new Set(state.availableTexts.map(text => text.gradeLevel))];
      return gradeLevels.sort((a, b) => a - b);
    }
  },

  actions: {
    async fetchReports(filters: ReportFilters = {}) {
      this.isLoading = true;
      this.error = null;

      try {
        // API call to fetch all reports with filters
        const response = await api.get('/teacher/reports', { params: filters });
        
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

        // Extract unique texts from the reports
        this.updateAvailableTexts();
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch reports';
        console.error('Error fetching reports:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Update available texts list from reports
    updateAvailableTexts() {
      const textsMap = new Map();
      
      this.reports.forEach(report => {
        if (report.textTitle && !textsMap.has(report.textTitle)) {
          textsMap.set(report.textTitle, {
            id: report.textTitle, // Using title as id since we don't have text_id
            title: report.textTitle,
            gradeLevel: report.gradeLevel
          });
        }
      });
      
      this.availableTexts = Array.from(textsMap.values());
    },

    // Helper method to format category names for display
    formatCategoryName(category: string): string {
      // Convert snake_case to Title Case
      return category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },

    async fetchSingleReport(studentId: string, reportId: string) {
      this.isLoading = true;
      this.error = null;
      this.currentSingleReport = null;

      try {
        // Fetch the single report data
        const response = await api.get(`/teacher/reports/student/${studentId}/report/${reportId}`);
        
        const reportData = response.data;
        
        // Extract category performance data from the main report
        const categoryPerformance: CategoryPerformance[] = [];
        
        // Extract category scores from the report data
        const categories = [
          'literal_basic', 
          'literal_detailed', 
          'vocabulary', 
          'inferential_simple', 
          'inferential_complex', 
          'structural_basic', 
          'structural_advanced'
        ];
        
        categories.forEach(category => {
          const scoreField = `${category}_success`;
          if (reportData[scoreField] && reportData[scoreField] > 0) {
            categoryPerformance.push({
              category: this.formatCategoryName(category),
              score: reportData[scoreField]
            });
          }
        });
        
        this.currentSingleReport = {
          id: reportId,
          studentId,
          studentName: reportData.student_name,
          textTitle: reportData.text_title,
          textType: reportData.text_type || '',
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
          },
          // Add the questions data if it exists in the response
          questions: reportData.questions || []
        };
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch report';
        console.error('Error fetching single report:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
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
      this.availableTexts = [];
    }
  }
});