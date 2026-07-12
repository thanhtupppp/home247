import { z } from 'zod';

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
  startDate: z.string().nullable().default(null),
  endDate: z.string().nullable().default(null),
}).refine(data => {
  if (data.startDate && data.endDate) {
    const parseDate = (dStr: string) => {
      const parts = dStr.split('/');
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
      return null;
    };
    const start = parseDate(data.startDate);
    const end = parseDate(data.endDate);
    if (start && end && end < start) {
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
  category: z.enum(['water', 'electricity', 'internet', 'parking', 'cleanliness', 'other']).default('other'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  summary: z.string().default('Yêu cầu hỗ trợ'),
  suggestedAction: z.string().default('Kiểm tra thực tế tại phòng cư dân.'),
  suggestedReply: z.string().default('Ban quản lý đã nhận được phản ánh và sẽ cử kỹ thuật viên kiểm tra sớm nhất.')
});

export type SupportRequestOutput = z.infer<typeof supportRequestSchema>;
