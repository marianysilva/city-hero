# Atoms

Primitives: Button, IconButton, Pill, Chip, Skeleton, Toast, Switch, Avatar, TextInput, ProgressBar,
etc.

Each component gets its own folder once it has a story/test/types sibling (`Button/Button.tsx`,
`Button/Button.stories.tsx`, ...). See
[`docs/engineering/design-system.md`](../../../../docs/engineering/design-system.md) and
[`component-inventory.md`](../../../../docs/engineering/component-inventory.md).

## Implemented

- `Button` — variant (`primary` | `secondary` | `ghost` | `destructive`) × size (`sm` | `md` |
  `lg`), plus `loading`/`disabled` states. See `Button/Button.stories.tsx` for the full example set.
