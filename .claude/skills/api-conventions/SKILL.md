---
name: api-conventions
description: Open311-compliant REST API design conventions for CityHero
---

# API Conventions

All CityHero API endpoints must follow the Open311 GeoReport v2 standard for civic system interoperability.

## URL Design

- Use kebab-case for URL paths: `/api/v1/service-requests`
- Version APIs in the URL path: `/v1/`, `/v2/`
- Resource names are plural nouns: `/tickets`, `/users`, `/teams`
- Nested resources for clear ownership: `/cities/{city_id}/tickets`

## Request/Response

- Use camelCase for all JSON property names
- Always include pagination for list endpoints (`page`, `pageSize`, `total`)
- Return consistent error format: `{ "error": { "code": "...", "message": "..." } }`
- All timestamps in ISO 8601 format with timezone (UTC)
- Geographic coordinates as GeoJSON (`{ "type": "Point", "coordinates": [lng, lat] }`)

## Multi-tenancy

- EVERY query must be scoped by `city_id` — no exceptions
- City context comes from the authenticated user's token, not URL params
- Cross-city queries are admin-only and must be explicitly flagged

## Authentication & Authorization

- JWT tokens for API auth, refresh token rotation enabled
- RBAC roles: `citizen`, `field_team`, `dispatcher`, `manager`, `admin`, `superadmin`
- Permission checks at both route and service layer

## Privacy Pipeline

IMPORTANT: Any endpoint accepting photo uploads MUST route through the anonymization pipeline (face/plate blur) before storage or display. This is a legal requirement (LGPD/GDPR).
