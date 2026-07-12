import { z } from 'zod';

/**
 * Reusable helper to check if a parsed day/month/year forms a valid calendar date
 */
export const isValidCalendarDate = (d: number, m: number, y: number): boolean => {
  const dateObj = new Date(y, m, d);
  return dateObj.getFullYear() === y && dateObj.getMonth() === m && dateObj.getDate() === d;
};

/**
 * Validates if string follows DD/MM/YYYY format and is a valid calendar date
 */
export const isValidDDMMYYYY = (val: string): boolean => {
  const parts = val.split('/');
  if (parts.length !== 3) return false;
  const d = Number(parts[0]);
  const m = Number(parts[1]) - 1;
  const y = Number(parts[2]);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
  return isValidCalendarDate(d, m, y);
};

// Strict DD/MM/YYYY schema
export const dateSchema = z
  .string()
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Định dạng ngày phải là DD/MM/YYYY")
  .refine(isValidDDMMYYYY, "Ngày không tồn tại trên lịch");

/**
 * 1. Schema for OCR Meter Reading validation
 */
export const ocrUtilityMeterSchema = z.object({
  reading: z.number().int().nonnegative("Chỉ số công tơ phải là số nguyên không âm."),
  confidence: z.number().min(0).max(1, "Độ tự tin phải nằm trong khoảng 0 đến 1."),
  meterType: z.enum(['electricity', 'water', 'unknown']).default('unknown'),
});

export type OCRUtilityMeterOutput = z.infer<typeof ocrUtilityMeterSchema>;

/**
 * 2. Schema for Contract Summary validation
 */
export const summarizeContractSchema = z.object({
  tenantName: z.string().nullable().default(null),
  phoneNumber: z.string().nullable().default(null),
  rentPrice: z.number().nonnegative("Giá thuê không được là số âm.").nullable().default(null),
  depositPrice: z.number().nonnegative("Tiền cọc không được là số âm.").nullable().default(null),
  startDate: dateSchema.nullable().default(null),
  endDate: dateSchema.nullable().default(null),
}).refine(data => {
  if (data.startDate && data.endDate) {
    const parseDate = (dStr: string) => {
      const parts = dStr.split('/');
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    };
    const start = parseDate(data.startDate);
    const end = parseDate(data.endDate);
    if (end < start) {
      return false; // Invalid: end date is before start date
    }
  }
  return true;
}, {
  message: "Ngày kết thúc hợp đồng không được trước ngày bắt đầu.",
  path: ["endDate"]
});

export type SummarizeContractOutput = z.infer<typeof summarizeContractSchema>;

/**
 * 3. Schema for Support Request analysis
 */
export const supportRequestSchema = z.object({
  category: z.enum(['water', 'electricity', 'internet', 'parking', 'cleanliness', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  summary: z.string().min(1, "Tóm tắt không được để trống."),
  suggestedAction: z.string().optional(),
  suggestedReply: z.string().min(1, "Câu trả lời đề xuất không được để trống.")
});

export type SupportRequestOutput = z.infer<typeof supportRequestSchema>;
