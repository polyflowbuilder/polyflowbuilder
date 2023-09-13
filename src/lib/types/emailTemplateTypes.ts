interface FeedbackEmailTemplateData {
  name: 'feedback';
  data: {
    subject: string;
    returnEmail?: string;
    feedbackContent: string;
  };
}

interface ResetPasswordEmailTemplateData {
  name: 'resetpw';
  data: {
    email: string;
    token: string;
    domain: string;
  };
}

export type EmailTemplateData = FeedbackEmailTemplateData | ResetPasswordEmailTemplateData;
