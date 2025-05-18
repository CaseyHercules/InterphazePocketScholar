import { db } from "@/lib/db";
import {
  withAdminAuth,
  validateRequest,
  validateResourceOwnership,
  getQueryParam,
} from "@/lib/api-utils";
import { z } from "zod";

const FAQValidator = z.object({
  question: z.string().min(1),
  answer: z.any().refine((val) => val !== undefined && val !== null, {
    message: "Answer is required",
  }),
});

const UpdateFAQValidator = z.object({
  id: z.string(),
  question: z.string().min(1),
  answer: z.any().refine((val) => val !== undefined && val !== null, {
    message: "Answer is required",
  }),
});

type FAQData = z.infer<typeof FAQValidator>;
type UpdateFAQData = z.infer<typeof UpdateFAQValidator>;

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  return withAdminAuth<any>(async () => {
    const { data, error } = await validateRequest<FAQData>(req, FAQValidator);
    if (error) {
      return { error, status: 422 };
    }

    if (!data) {
      return { error: "Invalid request data", status: 422 };
    }

    const faq = await db.eventFAQ.create({
      data: {
        question: data.question,
        answer: data.answer,
        eventId: params.eventId,
      },
    });

    return { data: faq, status: 201 };
  });
}

export async function PUT(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  return withAdminAuth<any>(async () => {
    const { data, error } = await validateRequest<UpdateFAQData>(
      req,
      UpdateFAQValidator
    );
    if (error) {
      return { error, status: 422 };
    }

    if (!data) {
      return { error: "Invalid request data", status: 422 };
    }

    const { id, ...updateData } = data;

    // Verify FAQ belongs to this event
    const { resource: existingFAQ, error: findError } =
      await validateResourceOwnership(
        () =>
          db.eventFAQ.findFirst({
            where: {
              id,
              eventId: params.eventId,
            },
          }),
        "FAQ not found"
      );

    if (findError) {
      return { error: findError, status: 404 };
    }

    const updatedFAQ = await db.eventFAQ.update({
      where: { id },
      data: updateData,
    });

    return { data: updatedFAQ, status: 200 };
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  return withAdminAuth<void>(async () => {
    const faqId = getQueryParam(req, "id");
    if (!faqId) {
      return { error: "FAQ ID is required", status: 400 };
    }

    // Verify FAQ belongs to this event
    const { resource: existingFAQ, error: findError } =
      await validateResourceOwnership(
        () =>
          db.eventFAQ.findFirst({
            where: {
              id: faqId,
              eventId: params.eventId,
            },
          }),
        "FAQ not found"
      );

    if (findError) {
      return { error: findError, status: 404 };
    }

    await db.eventFAQ.delete({
      where: { id: faqId },
    });

    return { status: 204 };
  });
}
