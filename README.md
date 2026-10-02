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

## Components

| Component | Props | Slot | Notes |
| --- | --- | --- | --- |
| `Button` | `tone: Tone`, `size: Size = Size.Md` | yes | the label is the slot content |
| `Badge` | `tone: Tone` | yes | a small status pill |
| `Alert` | `tone: Tone`, `title: string` | yes | bordered callout; message in the slot |
| `Card` | `title: string` | yes | titled surface |
| `Field` | `label: string` | yes | labelled form-field wrapper; put the input in the slot |
| `Disclosure` | `summary: string` | yes | expand/collapse (native `<details>`) |
| `Modal` | `title: string`, `id: string = ""`, `open: bool = false` | yes | native `<dialog>`; closes via a `method="dialog"` form; reopen with `data-kyte-open="<id>"` via the enhancer |
| `Spinner` | | no | pure-CSS loading spinner |
| `Divider` | | no | horizontal rule |
| `Avatar` | `src: string`, `alt: string = ""` | no | circular image |

Every component also takes an optional `cls: string = ""` that is appended to its base
classes, so you can restyle without forking.

## Interactive widgets

These are **data-driven** (pass a structure, get `Html`), used as `{ui.tree(nodes)}` etc.
They are ARIA-labelled and ship no bundled JavaScript.

| Widget | Call | Data | Interaction |
|---|---|---|---|
| **TreeView** | `ui.tree(nodes)` | `List<TreeNode>` (recursive) | native `<details>`, expand/collapse + keyboard, **no JS** |
| **Dropdown** | `<ui.Dropdown label="…">…</ui.Dropdown>` | slot | native `<details>` toggle, **no JS** (outside-click/Escape close via optional JS) |
| **Tabs** | `ui.tabs(group, items)` | `List<TabItem{label, panel}>` | first tab shown statically; click + arrow keys via optional JS |
| **Menu** | `ui.menu(items)` | `List<MenuLink{label, href}>` | accessible link list statically; arrow-key roving via optional JS |

`TreeNode(label)` then `.children.push(...)`; `TabItem(label, panel: Html)`; `MenuLink(label, href)`.
`ui.tabs`'s `group` must be unique on the page (it namespaces the tab/panel ids).

### Optional enhancer: `kyte-ui.js`

TreeView and Dropdown work with no JavaScript. Tabs and Menu render correct, accessible
markup that is usable statically (Tabs shows the first panel; Menu is a focusable link
list), and become fully interactive (tab switching, `aria-selected`, arrow-key roving,
dropdown outside-click/Escape close) when you include the **optional** `kyte-ui.js`:

```html
<script src="/kyte-ui.js" defer></script>
```

It is dependency-free, loaded once globally, and uses event delegation so it also covers
markup your hypermedia framework swaps in later. Nothing is bundled or auto-loaded; if you
prefer to drive these with Alpine or your own code, leave it out and wire the ARIA
attributes yourself.

`Tone` is `Primary`, `Secondary`, `Success`, `Danger`, `Warning`.

`Modal` renders a native `<dialog>`. Pass `open={true}` to render it open (a server- or
framework-driven decision); the built-in close button uses `<form method="dialog">`, which
closes the dialog natively. To open it from the client (including reopening after a close),
give the Modal an `id` and put `data-kyte-open="<id>"` on any trigger element: the optional
`kyte-ui.js` enhancer calls `showModal()` on click (and `data-kyte-close` closes the
enclosing dialog). Without the enhancer the component stays framework-agnostic, so you can
drive opening through your hypermedia framework instead.

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

## Demo gallery

`gallery.ky` renders every component into a single `gallery.html` you can open in a
browser (Tailwind via the Play CDN; the interactive widgets driven by `kyte-ui.js`,
both linked by the page):

```sh
kyte gallery.ky -o /tmp/gallery && /tmp/gallery > gallery.html
open gallery.html
```

## Status

14 components: 10 presentational (`Button`, `Badge`, `Alert`, `Card`, `Field`,
`Disclosure`, `Modal`, `Spinner`, `Divider`, `Avatar`) and 4 interactive widgets
(`TreeView`, `Dropdown`, `Tabs`, `Menu`). Typed `Tone` and `Size` variants, an optional
`cls` override on every component, and cross-module usage via qualified tags. TreeView,
Dropdown, and Disclosure are no-JS native `<details>`; Tabs and Menu are ARIA-correct and
enhanced by the optional `kyte-ui.js`. See the gallery above to view them all.

Possible next steps: `Input`/`Select`/`Textarea` field primitives, a `Toast`/notification,
and a dark-theme pass.
