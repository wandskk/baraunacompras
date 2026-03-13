This skill is responsible for implementing the theming system of the SaaS platform.

The project uses Tailwind CSS and must support dynamic store themes.

Themes allow each store to customize its visual identity.

The system must use CSS variables combined with Tailwind configuration.

Rules:

Themes must be implemented using design tokens.

Themes must define:

primary color
secondary color
background color
text color
border radius
optional accent colors

Tailwind configuration must reference CSS variables.

Example:

colors:
primary: var(--color-primary)

Themes must live inside:

src/themes

Each theme must export a theme configuration object.

Example:

export const modernTheme = {
primary
secondary
background
text
radius
}

The theme applied to a store must be stored in the database.

Store entities must contain a theme field.

Themes must be applied dynamically when a store page loads.

Theme logic must live inside:

src/lib/theme

UI components must only use Tailwind utility classes and must not contain theme logic.

All theme values must come from CSS variables.

The system must allow adding new themes without modifying existing components.
