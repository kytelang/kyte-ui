# kyte-ui

A small, presentational component kit for Kyte's KYX views, styled with Tailwind CSS
utility classes. It is an optional package built on Kyte's `component` feature, not part
of the language standard library.

## Install

kyte-ui is a git-URL dependency. Add it to your `project.json` dependencies and import it:

```kyte
import ui;

fn page(name: string): Html {
    return <ui.Card title={name}>
        <ui.Badge tone={ui.Tone.Success}>active</ui.Badge>
        <ui.Button tone={ui.Tone.Primary}>Save</ui.Button>
    </ui.Card>;
}
```

Components are used with qualified tags (`<ui.Name .../>`), props are passed by name and
type-checked, and children fill the component's slot.

## Components (v0)

| Component | Props | Slot | Notes |
| --- | --- | --- | --- |
| `Button` | `tone: Tone` | yes | the label is the slot content |
| `Badge` | `tone: Tone` | yes | a small status pill |
| `Alert` | `tone: Tone`, `title: string` | yes | bordered callout; message in the slot |
| `Card` | `title: string` | yes | titled surface |
| `Field` | `label: string` | yes | labelled form-field wrapper; put the input in the slot |
| `Disclosure` | `summary: string` | yes | expand/collapse |

`Tone` is `Primary`, `Secondary`, `Success`, `Danger`, `Warning`.

## Interactivity is generic, not tied to one framework

The interactive pieces use HTML-native mechanisms, so they work under any hypermedia
framework (htmx, Unpoly, Alpine, datastar) or none, with no bundled JavaScript.
`Disclosure` is a native `<details>` element. Dropdowns and accordions build on the same
mechanism. Where behaviour must be server-driven (load content into a panel, submit and
swap), express it in your handler through `web.hyper`, which already speaks each
framework's dialect; the components stay neutral markup.

## Tailwind: keep the classes

Tailwind's JIT only emits the utility classes it can see in your `content` sources. Since
this kit's classes live in the package, add the package to your Tailwind `content` globs so
they are not purged:

```js
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{ky,kyx}",
    "./**/kyte-ui/**/*.ky",   // keep kyte-ui's utility classes
  ],
};
```

A `safelist.txt` of every class this kit emits is also provided for setups that prefer an
explicit safelist over a content glob.

## Status

v0: presentational components with typed variants, plus one HTML-native interactive
(`Disclosure`). Planned: optional props and a `class` override prop (so components can be
restyled without forking), `Size` variants, and more interactive patterns (Modal via
`<dialog>`, Tabs). These wait on an optional-props language feature so overrides stay
ergonomic.
