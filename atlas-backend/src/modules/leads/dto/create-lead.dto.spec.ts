import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateLeadDto } from './create-lead.dto';

/**
 * Tests for:
 * - invalid email rejection
 * - missing required field rejection
 */
describe('CreateLeadDto — Validation', () => {
  const validPayload = {
    full_name: 'John Smith',
    email: 'john@example.com',
    consent_status: true,
    cf_turnstile_token: 'valid-token',
  };

  async function validateDto(payload: Record<string, unknown>) {
    const dto = plainToInstance(CreateLeadDto, payload);
    return validate(dto);
  }

  // ─── Valid payload ────────────────────────────────────────────────────────────
  it('passes validation with a complete, valid payload', async () => {
    const errors = await validateDto(validPayload);
    expect(errors).toHaveLength(0);
  });

  // ─── Invalid email rejection ──────────────────────────────────────────────────
  it('rejects a plain string that is not an email address', async () => {
    const errors = await validateDto({ ...validPayload, email: 'not-an-email' });
    const emailErrors = errors.filter((e) => e.property === 'email');
    expect(emailErrors.length).toBeGreaterThan(0);
  });

  it('rejects an email that is missing the domain part', async () => {
    const errors = await validateDto({ ...validPayload, email: 'john@' });
    const emailErrors = errors.filter((e) => e.property === 'email');
    expect(emailErrors.length).toBeGreaterThan(0);
  });

  it('rejects an empty string as an email', async () => {
    const errors = await validateDto({ ...validPayload, email: '' });
    const emailErrors = errors.filter((e) => e.property === 'email');
    expect(emailErrors.length).toBeGreaterThan(0);
  });

  // ─── Missing required field rejection ────────────────────────────────────────
  it('rejects a payload that is missing the full_name field', async () => {
    const { full_name, ...withoutName } = validPayload;
    void full_name;
    const errors = await validateDto(withoutName);
    const nameErrors = errors.filter((e) => e.property === 'full_name');
    expect(nameErrors.length).toBeGreaterThan(0);
  });

  it('rejects a payload that is missing the email field', async () => {
    const { email, ...withoutEmail } = validPayload;
    void email;
    const errors = await validateDto(withoutEmail);
    const emailErrors = errors.filter((e) => e.property === 'email');
    expect(emailErrors.length).toBeGreaterThan(0);
  });

  it('rejects a payload that is missing the cf_turnstile_token field', async () => {
    const { cf_turnstile_token, ...withoutToken } = validPayload;
    void cf_turnstile_token;
    const errors = await validateDto(withoutToken);
    const tokenErrors = errors.filter((e) => e.property === 'cf_turnstile_token');
    expect(tokenErrors.length).toBeGreaterThan(0);
  });

  it('rejects a payload that is missing the consent_status field', async () => {
    const { consent_status, ...withoutConsent } = validPayload;
    void consent_status;
    const errors = await validateDto(withoutConsent);
    const consentErrors = errors.filter((e) => e.property === 'consent_status');
    expect(consentErrors.length).toBeGreaterThan(0);
  });

  it('rejects an empty full_name string', async () => {
    const errors = await validateDto({ ...validPayload, full_name: '' });
    const nameErrors = errors.filter((e) => e.property === 'full_name');
    expect(nameErrors.length).toBeGreaterThan(0);
  });

  // ─── Optional fields ─────────────────────────────────────────────────────────
  it('passes when all optional fields are absent', async () => {
    const errors = await validateDto(validPayload);
    expect(errors).toHaveLength(0);
  });

  it('passes with all optional fields provided', async () => {
    const errors = await validateDto({
      ...validPayload,
      phone: '+61411222333',
      company_name: 'ABC Mortgage Brokers',
      country: 'Australia',
      business_type: 'Mortgage Broker',
      industry: 'Finance',
      role: 'Director',
      website_url: 'https://example.com',
      company_size: '1-10',
      current_problem: 'Manual onboarding',
      automation_interest: 'AI assistant',
      preferred_contact_method: 'Email',
      message: 'Looking to automate',
      source_page: '/atlas',
      utm_source: 'linkedin',
      utm_medium: 'cpc',
      utm_campaign: 'q4',
    });
    expect(errors).toHaveLength(0);
  });
});
