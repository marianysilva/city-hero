# Public Work Detail · Photo gallery

> **Type:** Screen feature · UI + media
> **Screen:** SCREEN 27 · Public Work Detail
> **Effort:** M (1-2 days)
> **Dependencies:** `27-public-work-detail/01-render-work-detail-ui-base.md`, `00-foundation/08-anonymization-pipeline.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `media`

## Context

A horizontal carousel of construction photos posted by the prefecture, organized by date (the user can swipe through "Hoje, Ontem, Semana passada..."). Tapping opens a full-screen lightbox.

All photos go through the same anonymization pipeline as citizen photos.

## Acceptance Criteria

### Scenario · Default render

**Given** the work has photos
**When** the gallery renders
**Then** a small label "FOTOS DA OBRA"
**And** a horizontal carousel of photos with date labels above each
**And** swipe to scroll

### Scenario · Tap to expand

**Given** the user taps a photo
**When** the action runs
**Then** a full-screen lightbox opens
**And** the user can pinch-zoom, swipe between photos, and tap to close

### Scenario · No photos

**Given** the work has no photos yet
**When** the gallery renders
**Then** a placeholder appears: "Sem fotos ainda · A prefeitura vai postar conforme avança a obra"

### Scenario · Anonymized photos

**Given** photos may include incidentally captured faces
**When** they render
**Then** only the anonymized versions are visible
**And** the anonymization badge "✓ Anonimização ativa" appears below the gallery

### Scenario · Real-time additions

**Given** the prefecture posts a new photo
**When** the WS pushes
**Then** the new photo appears at the start with a small animation

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** date labels and labels translate

### Scenario · Accessibility

**Given** SR is on
**When** the gallery is navigated
**Then** each photo has a description (date + work name)
**And** the lightbox is fully accessible

## Frontend

```
apps/city-hero/src/screens/PublicWorkDetail/
└── components/
    ├── ConstructionPhotoGallery.tsx
    └── PhotoLightbox.tsx
```

## Backend

| Method | Path                                                              | Purpose                              |
|--------|-------------------------------------------------------------------|---------------------------------------|
| GET    | `/api/v1/public-works/{id}/photos?cursor=&limit=`                 | Paginated photos                     |

## Database

`public_work_photos` table with: id, work_id, photo_id (links to the photos table), posted_by_role, posted_at, caption.

## Edge Cases

- **Photo still anonymizing**: placeholder shown until ready.
- **Very large gallery**: virtualization keeps scroll smooth.

## Privacy / LGPD

All photos anonymized.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `public_work_detail.gallery_loaded` | Mounted                                   | `photo_count`                         |
| `public_work_detail.photo_opened`  | User tapped                                | `photo_id`                            |

## Tests

- **Unit**: carousel; lightbox; placeholder.
- **Snapshot**: empty + populated.
- **A11y**: descriptions.

## Definition of Done

- [ ] ConstructionPhotoGallery + PhotoLightbox
- [ ] Backend endpoint
- [ ] Anonymization integration
- [ ] Real-time additions
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Cross-cutting: `docs/engineering/`
- Anonymization pipeline: `00-foundation/08-anonymization-pipeline.md`
- `CLAUDE.md`
