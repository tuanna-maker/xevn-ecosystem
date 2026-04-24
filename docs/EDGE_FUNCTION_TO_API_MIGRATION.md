# Edge Function to Backend API Migration

| Supabase Edge Function | Backend API replacement | Status |
|---|---|---|
| `create-platform-admin` | `POST /api/v1/admin/platform-admins` | API contract added |
| `create-company-admin` | `POST /api/v1/admin/company-admins` | API contract added |
| `invite-employee` | `POST /api/v1/admin/employees/invitations` | API contract added |
| `reset-user-password` | `POST /api/v1/admin/auth/password-reset` | API contract added |
| `hrm-ai-chat` | `POST /api/v1/ai/hrm-chat` | API contract added |
| `landing-ai-chat` | `POST /api/v1/ai/landing-chat` | API contract added |
| `elevenlabs-tts` | `POST /api/v1/ai/tts` | API contract added |

Frontend migration rule:

- New code must call the backend API client first.
- Existing Supabase Edge Functions are deprecated compatibility entrypoints.
- Remove Edge Function usage after each HRM screen has been moved to the backend API client.
