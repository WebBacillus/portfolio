---
summary: "A reservation platform for massage shops, with OTP-based sign-up and reviews."
role: "University team project. I contributed to the backend alongside teammates."
---

## What it does

The Massage Shop Reservation System lets people browse massage shops, book appointments, and leave reviews afterwards. The front end is a separate repository; this repository holds the API the client talks to.

## How it works

Five components make up the system: user accounts, shop listings, appointment scheduling, reviews and ratings, and the authentication layer that ties them together. The API exposes RESTful endpoints, each mapped to a controller that owns the business logic for its domain.

### Authentication with OTP

Registration takes a name, email, phone number, and password. The phone number is verified with a one-time password sent over SMS through Twilio, so an account is tied to a real, reachable number. Once signed in, the API issues a JWT for subsequent requests.

## Security

The service treats an unauthenticated, internet-facing API as hostile input, and the middleware stack reflects that:

- **Data sanitization** against NoSQL injection, since MongoDB queries are built from user-supplied values.
- **Security headers** through Helmet.
- **XSS protection** with an express XSS sanitizer.
- **Rate limiting** to slow down brute-force attempts.
- **HTTP parameter pollution** protection with hpp.
- **CORS** configuration so only the expected client origin can call the API.

## Tech stack

| Category | Technologies |
| --- | --- |
| Backend framework | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT, bcryptjs, Twilio OTP |
| Security | helmet, express-mongo-sanitize, express-xss-sanitizer, express-rate-limit, hpp |
| API documentation | Swagger UI, Swagger JSDoc |
| Testing | Jest |

## Data model

Five related models cover the domain: users, massage shops, appointments and reservations, reviews and ratings, and the supporting session and verification records.
