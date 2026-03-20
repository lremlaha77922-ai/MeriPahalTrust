import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Check if current time is within PDF upload window (6:00 AM - 7:00 AM)
export function isWithinUploadWindow(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // Between 6:00 AM (inclusive) and 7:00 AM (exclusive)
  return hours === 6 || (hours === 7 && minutes === 0);
}

// Check if submission is late (after 7:00 AM)
export function isSubmissionLate(): boolean {
  const now = new Date();
  const hours = now.getHours();
  
  // After 7:00 AM
  return hours >= 7;
}

// Get time remaining until upload window closes
export function getTimeRemainingInWindow(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  if (hours < 6) {
    const hoursUntil = 6 - hours - 1;
    const minutesUntil = 60 - minutes;
    return `${hoursUntil} घंटे ${minutesUntil} मिनट में खुलेगा`;
  }
  
  if (hours === 6) {
    const minutesLeft = 59 - minutes;
    return `${minutesLeft} मिनट शेष`;
  }
  
  return 'समय समाप्त';
}

// Format date to Indian format
export function formatIndianDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('hi-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// Format time to Indian format
export function formatIndianTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('hi-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// Validate PDF file
export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'केवल PDF फ़ाइल स्वीकार की जाती है' };
  }
  
  // Check file size (5MB = 5 * 1024 * 1024 bytes)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'फ़ाइल का आकार 5MB से अधिक नहीं होना चाहिए' };
  }
  
  return { valid: true };
}
