import { z } from "zod";

// Base validator for coordinates
const CoordinatesValidator = z.object({
  lat: z.number(),
  lng: z.number(),
});

// Base validator for FAQ items
const FAQValidator = z.object({
  question: z
    .string()
    .min(3, "Question must be at least 3 characters")
    .max(255, "Question too long"),
  answer: z.any(), // EditorJS content
});

// Promo code validator
const PromoCodeValidator = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(50, "Code too long"),
  discount: z.number().min(0, "Discount cannot be negative"),
  isPercentage: z.boolean().default(true),
  maxUses: z.number().int().positive().optional(),
  validFrom: z.string().transform((str) => new Date(str)),
  validUntil: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
});

// Attendee validator
const AttendeeValidator = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long"),
  email: z.string().email().optional(),
});

// Base event validator with common fields
const EventBaseValidator = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title too long"),
  description: z.any(), // EditorJS content
  date: z.string().transform((str) => new Date(str)),
  endDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  location: z
    .string()
    .min(3, "Location must be at least 3 characters")
    .max(255, "Location too long"),
  address: z
    .string()
    .min(3, "Address must be at least 3 characters")
    .max(255, "Address too long"),
  coordinates: CoordinatesValidator.optional(),
  capacity: z.number().int().positive().optional(),
  price: z.number().min(0).optional(),
  registrationEnd: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]),
  faqs: z.array(FAQValidator).optional(),
});

// Create event validator
export const CreateEventValidator = EventBaseValidator;

// Update event validator (includes ID)
export const UpdateEventValidator = EventBaseValidator.extend({
  id: z.string(),
});

// Registration validator with multiple attendees
export const EventRegistrationValidator = z.object({
  eventId: z.string(),
  attendees: z
    .array(AttendeeValidator)
    .min(1, "At least one attendee is required"),
  promoCode: z.string().optional(),
});

// Promo code creation validator
export const CreatePromoCodeValidator = PromoCodeValidator.extend({
  eventId: z.string(),
});

// Types
export type CreateEventPayload = z.infer<typeof CreateEventValidator>;
export type UpdateEventPayload = z.infer<typeof UpdateEventValidator>;
export type EventRegistrationPayload = z.infer<
  typeof EventRegistrationValidator
>;
export type CreatePromoCodePayload = z.infer<typeof CreatePromoCodeValidator>;
