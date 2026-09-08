# Postman Test Plan — User Profile & Team Management API

Base URL: `http://localhost:3000` (adjust to your `PORT`)

## 0. Setup

1. Login to get a JWT:
   - `POST /api/auth/login`
   - Body (JSON): `{ "email": "<existing-user-email>", "password": "<password>" }`
   - Copy `token` from the response.
2. In Postman, create an environment variable `token` = the JWT above.
3. For every request below, set header `Authorization: Bearer {{token}}`.

## 1. Get current profile (AC1)

- `GET /api/users/profile`
- No body.
- Expect `200`, `success: true`, `data` with `id, name, email, role, job_title, created_at`.

## 2. Update current profile (AC2)

- `PATCH /api/users/profile`
- Body:
  ```json
  { "name": "Arya Updated", "job_title": "Backend Engineer" }
  ```
- Expect `200`, `data.name` and `data.job_title` reflect the update.
- Edge case: set `email` to an email already used by another user → expect `409 Conflict`.
- Edge case: send `email: "not-an-email"` → expect `400 Bad Request` (validation).

## 3. List team members (AC3)

- `GET /api/users`
- No body.
- Expect `200`, `data` is an array of users each with `role`.

## 4. Invite a new member (AC4)

- `POST /api/users/invite`
- Body:
  ```json
  { "name": "New Member", "email": "newmember@test.com", "role": "Member" }
  ```
- Expect `201/200`, `data` contains the new user (no password fields exposed).
- Default password for the invited account is `Welcome123!` — verify by logging in as the new user via `POST /api/auth/login`.
- Edge case: repeat the same request → expect `409 Conflict` (duplicate email).
- Edge case: omit `email` → expect `400 Bad Request`.

## 5. Update a member's role (AC4)

- `PATCH /api/users/:id/role` (use the `id` returned from step 4)
- Body:
  ```json
  { "role": "Admin" }
  ```
- Expect `200`, `data.role` is `"Admin"`.
- Edge case: use a random/nonexistent UUID → expect `404 Not Found`.

## 6. Auth guard check

- Repeat any request above without the `Authorization` header → expect `401 Unauthorized`.
