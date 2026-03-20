import { AttendanceRecord, SurveyRecord, PdfSubmission, Deposit } from '@/types';

// Calculate attendance percentage
export function calculateAttendancePercentage(
  attendanceRecords: AttendanceRecord[],
  days: number = 30
): number {
  if (attendanceRecords.length === 0) return 0;
  const presentDays = attendanceRecords.filter(r => r.is_present).length;
  return Math.round((presentDays / Math.min(attendanceRecords.length, days)) * 100);
}

// Calculate survey completion rate
export function calculateSurveyCompletionRate(
  surveyRecords: SurveyRecord[],
  targetPerDay: number = 10
): number {
  if (surveyRecords.length === 0) return 0;
  const totalSurveys = surveyRecords.reduce((sum, r) => sum + r.survey_count, 0);
  const targetTotal = surveyRecords.length * targetPerDay;
  return Math.min(Math.round((totalSurveys / targetTotal) * 100), 100);
}

// Calculate PDF punctuality score
export function calculatePdfPunctualityScore(pdfSubmissions: PdfSubmission[]): number {
  if (pdfSubmissions.length === 0) return 0;
  const onTimeSubmissions = pdfSubmissions.filter(p => !p.is_late).length;
  return Math.round((onTimeSubmissions / pdfSubmissions.length) * 100);
}

// Calculate deposit compliance
export function calculateDepositCompliance(deposits: Deposit[]): number {
  if (deposits.length === 0) return 0;
  const approvedDeposits = deposits.filter(d => d.status === 'approved').length;
  return Math.round((approvedDeposits / deposits.length) * 100);
}

// Get performance badge
export interface PerformanceBadge {
  title: string;
  color: string;
  icon: string;
  description: string;
}

export function getPerformanceBadge(overallScore: number): PerformanceBadge {
  if (overallScore >= 90) {
    return {
      title: 'उत्कृष्ट कलाकार',
      color: 'bg-gradient-to-r from-yellow-400 to-amber-500',
      icon: '🏆',
      description: 'शानदार प्रदर्शन! आप टॉप परफॉर्मर हैं',
    };
  } else if (overallScore >= 75) {
    return {
      title: 'अच्छा कलाकार',
      color: 'bg-gradient-to-r from-green-400 to-emerald-500',
      icon: '⭐',
      description: 'बहुत अच्छा प्रदर्शन! थोड़ा और सुधार करें',
    };
  } else if (overallScore >= 60) {
    return {
      title: 'औसत प्रदर्शन',
      color: 'bg-gradient-to-r from-blue-400 to-cyan-500',
      icon: '👍',
      description: 'अच्छी शुरुआत! और मेहनत करें',
    };
  } else if (overallScore >= 40) {
    return {
      title: 'सुधार की आवश्यकता',
      color: 'bg-gradient-to-r from-amber-400 to-orange-500',
      icon: '⚠️',
      description: 'ध्यान दें! अपने प्रदर्शन में सुधार करें',
    };
  } else {
    return {
      title: 'तुरंत सुधार चाहिए',
      color: 'bg-gradient-to-r from-red-400 to-rose-500',
      icon: '🚨',
      description: 'गंभीर स्थिति! तुरंत कार्रवाई करें',
    };
  }
}

// Generate personalized suggestions
export function generateSuggestions(
  attendancePercentage: number,
  surveyRate: number,
  pdfScore: number,
  depositCompliance: number
): string[] {
  const suggestions: string[] = [];

  // Attendance suggestions
  if (attendancePercentage < 80) {
    suggestions.push('📅 नियमित रूप से उपस्थिति दर्ज करें - 5 दिन की अनुपस्थिति पर चेतावनी मिलती है');
  } else if (attendancePercentage >= 95) {
    suggestions.push('✅ उत्कृष्ट उपस्थिति! इसी तरह जारी रखें');
  }

  // Survey suggestions
  if (surveyRate < 70) {
    suggestions.push('📊 प्रतिदिन कम से कम 10 सर्वे पूरे करें - यह आपका मुख्य लक्ष्य है');
  } else if (surveyRate >= 90) {
    suggestions.push('🎯 शानदार सर्वे परफॉर्मेंस! आप टारगेट से आगे हैं');
  }

  // PDF punctuality suggestions
  if (pdfScore < 80) {
    suggestions.push('⏰ PDF अपलोड समय पर करें (6:00-7:00 AM) - लेट सबमिशन से बचें');
  } else if (pdfScore >= 95) {
    suggestions.push('📄 PDF सबमिशन में आप बहुत पंचुअल हैं - बढ़िया!');
  }

  // Deposit compliance suggestions
  if (depositCompliance < 80) {
    suggestions.push('💰 24 घंटे के अंदर जमा राशि सबमिट करें - देरी से चेतावनी मिल सकती है');
  } else if (depositCompliance >= 95) {
    suggestions.push('💳 जमा राशि में आप बहुत अनुशासित हैं - शाबाश!');
  }

  // Overall suggestions
  const overallScore = (attendancePercentage + surveyRate + pdfScore + depositCompliance) / 4;
  if (overallScore < 60) {
    suggestions.push('⚡ समग्र प्रदर्शन में तत्काल सुधार की आवश्यकता है - Guidelines ध्यान से पढ़ें');
  } else if (overallScore >= 90) {
    suggestions.push('🌟 आप टॉप परफॉर्मर हैं! अन्य सदस्यों के लिए प्रेरणा हैं');
  }

  // If no specific suggestions, add general positive message
  if (suggestions.length === 0) {
    suggestions.push('👏 अच्छा काम कर रहे हैं! सभी क्षेत्रों में संतुलन बनाए रखें');
  }

  return suggestions;
}

// Get weekly trend data
export function getWeeklyTrend(records: any[], dateField: string): { week: string; count: number }[] {
  const weekData: { [key: string]: number } = {};
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const weekDay = date.toLocaleDateString('hi-IN', { weekday: 'short' });
    weekData[weekDay] = 0;
  }

  records.forEach(record => {
    const recordDate = new Date(record[dateField]);
    const daysDiff = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 0 && daysDiff < 7) {
      const weekDay = recordDate.toLocaleDateString('hi-IN', { weekday: 'short' });
      weekData[weekDay] = (weekData[weekDay] || 0) + 1;
    }
  });

  return Object.entries(weekData).map(([week, count]) => ({ week, count }));
}

// Get monthly trend data
export function getMonthlyTrend(records: any[], dateField: string): { month: string; count: number }[] {
  const monthData: { [key: string]: number } = {};
  const today = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('hi-IN', { month: 'short' });
    monthData[monthName] = 0;
  }

  records.forEach(record => {
    const recordDate = new Date(record[dateField]);
    const monthName = recordDate.toLocaleDateString('hi-IN', { month: 'short' });
    
    if (monthData.hasOwnProperty(monthName)) {
      monthData[monthName]++;
    }
  });

  return Object.entries(monthData).map(([month, count]) => ({ month, count }));
}

// Calculate overall performance score
export function calculateOverallScore(
  attendancePercentage: number,
  surveyRate: number,
  pdfScore: number,
  depositCompliance: number
): number {
  // Weighted average (attendance: 30%, survey: 40%, pdf: 20%, deposit: 10%)
  return Math.round(
    attendancePercentage * 0.3 +
    surveyRate * 0.4 +
    pdfScore * 0.2 +
    depositCompliance * 0.1
  );
}
