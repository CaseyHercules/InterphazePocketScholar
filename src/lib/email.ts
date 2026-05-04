import { Resend } from "resend";

type RegistrationEmailInput = {
  to: string;
  eventTitle: string;
  ticketTitle: string;
  amountLabel: string;
  manageUrl: string;
};

type RefundEmailInput = {
  to: string;
  eventTitle: string;
  refundLabel: string;
};

let loggedMissingResendKey = false;

function getResendClient() {
  const apiKey = (process.env.RESEND_API_KEY ?? "").trim();
  if (!apiKey) {
    if (!loggedMissingResendKey && process.env.NODE_ENV !== "production") {
      loggedMissingResendKey = true;
      console.warn(
        "[email] RESEND_API_KEY is not configured. Transactional email is disabled in this environment."
      );
    }
    return null;
  }

  return new Resend(apiKey);
}

function getFromEmail() {
  return (process.env.RESEND_FROM_EMAIL ?? "").trim() || "Pocket Scholar <onboarding@resend.dev>";
}

async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResendClient();
  if (!resend) return;

  await resend.emails.send({
    from: getFromEmail(),
    to: args.to,
    subject: args.subject,
    html: args.html,
  });
}

export async function sendTicketConfirmation(input: RegistrationEmailInput) {
  await sendEmail({
    to: input.to,
    subject: `Registration confirmed: ${input.eventTitle}`,
    html: `<p>Your registration is confirmed.</p>
<p><strong>Event:</strong> ${input.eventTitle}</p>
<p><strong>Ticket:</strong> ${input.ticketTitle}</p>
<p><strong>Amount:</strong> ${input.amountLabel}</p>
<p>You can view your registration here: <a href="${input.manageUrl}">${input.manageUrl}</a></p>`,
  });
}

export async function sendAdminAssignedRegistration(
  input: RegistrationEmailInput
) {
  await sendEmail({
    to: input.to,
    subject: `You were registered for ${input.eventTitle}`,
    html: `<p>An admin registered you for an event.</p>
<p><strong>Event:</strong> ${input.eventTitle}</p>
<p><strong>Ticket:</strong> ${input.ticketTitle}</p>
<p><strong>Amount:</strong> ${input.amountLabel}</p>
<p>View details: <a href="${input.manageUrl}">${input.manageUrl}</a></p>`,
  });
}

export async function sendRefundNotice(input: RefundEmailInput) {
  await sendEmail({
    to: input.to,
    subject: `Refund processed: ${input.eventTitle}`,
    html: `<p>Your refund has been processed.</p>
<p><strong>Event:</strong> ${input.eventTitle}</p>
<p><strong>Refund amount:</strong> ${input.refundLabel}</p>`,
  });
}
