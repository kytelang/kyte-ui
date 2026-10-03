# kyte-ui

A small, presentational component kit for Kyte's KYX views, styled with Tailwind CSS
utility classes. It is an optional package built on Kyte's `component` feature, not part
of the language standard library.

## Install

kyte-ui is optional and not bundled with the `kyte init web` scaffold; you add it to a web app when
you want it. It is a git-URL dependency (Kyte has no central registry): add it to your `project.json`
and import it. A scaffolded project's own `README.md` has a short "Optional: the kyte-ui component
kit" section that walks through the same steps.

```json
{
  "dependencies": ["https://github.com/kytelang/kyte-ui"]
}
```

```kyte
import ui;

fn page(name: string): Html {
    return <ui.Card title={name}>
        <ui.Badge tone={ui.Tone.Success}>active</ui.Badge>
        <ui.Button tone={ui.Tone.Primary}>Save</ui.Button>
    </ui.Card>;
}
```

`kyte build` fetches the package. Components are used with qualified tags (`<ui.Name .../>`), props
are passed by name and type-checked, and children fill the component's slot. The one extra step for
styling is to keep Tailwind running so the kit's classes land in your stylesheet: see
[Keep Tailwind running](#keep-tailwind-running) below.

## Components

| Component | Props | Slot | Notes |
| --- | --- | --- | --- |
| `Button` | `tone: Tone`, `size: Size = Size.Md` | yes | the label is the slot content |
| `Badge` | `tone: Tone` | yes | a small status pill |
| `Alert` | `tone: Tone`, `title: string` | yes | bordered callout; message in the slot |
| `Card` | `title: string` | yes | titled surface |
| `Field` | `label: string` | yes | labelled form-field wrapper; put the input in the slot |
| `Input` | `name: string`, `type: string = "text"`, `placeholder: string = ""`, `value: string = ""` | no | styled text input; put it inside a `Field` for a label |
| `Select` | `name: string` | yes | styled select; the `<option>`s go in the slot |
| `Textarea` | `name: string`, `placeholder: string = ""`, `rows: string = "3"` | yes | multi-line input; initial text in the slot |
| `Checkbox` | `name: string`, `value: string = ""`, `label: string = ""`, `checked: bool = false` | no | labelled checkbox |
| `Radio` | `name: string`, `value: string = ""`, `label: string = ""`, `checked: bool = false` | no | labelled radio; group by sharing a `name` |
| `Toast` | `tone: Tone` | yes | dismissable notification (`role="status"`); close button removes it via the enhancer |
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

### Modal

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

## Keep Tailwind running

Tailwind only emits the utility classes it can see in its `content` sources, and it emits them
into one stylesheet (`wwwroot/index.css`) that your `index.html` links. So two things matter:
Tailwind must be able to see the kit's classes, and it must re-run whenever your markup changes.

This kit's component source is fetched to the Kyte package cache, not your project, so you do not
point Tailwind at it directly. Instead the kit ships a `safelist.txt` listing every class it emits;
download it into your project (for example `styles/kyte-ui.safelist.txt`) and add it to your Tailwind
`content` so the classes are always generated:

```js
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{kyx,ky}",
    "./wwwroot/*.html",
    "./styles/kyte-ui.safelist.txt", // emit kyte-ui's classes (its source is a fetched dependency)
  ],
};
```

Then **keep the Tailwind CLI running in watch mode** while you develop, so `wwwroot/index.css`
stays up to date as you add or change markup. If you stop it, new classes you use will be missing
until you run it again:

```sh
npm install        # once
npm run css:watch  # rebuilds wwwroot/index.css on every change; leave it running
```

The scaffold's `css:watch` script is
`tailwindcss -i ./styles/app.css -o ./wwwroot/index.css --watch`. For a production build run the
one-shot `npm run css` (which adds `--minify`) as part of your build, so the final `index.css` is
complete without the watcher.

### Dark mode

Enable the class strategy so the kit's `dark:` variants work. With the Tailwind v4 CLI, add a custom
variant to your `styles/app.css`:

```css
@import "tailwindcss";
@config "../tailwind.config.js";
@custom-variant dark (&:where(.dark, .dark *));
```

Then toggle the `.dark` class on `<html>` yourself; the kit does not bundle a toggle. A tiny script
that flips `.dark` for any `[data-theme-toggle]` element and persists the choice to `localStorage` is
a few lines; include it from `wwwroot` and reference it in your `index.html`.

## Trying it

Scaffold a web app and add kyte-ui to it. The generated project's `README.md` has an "Optional: the
kyte-ui component kit" section with the exact steps (dependency, safelist, `kyte-ui.js`, dark mode):

```sh
kyte init web --name myapp
cd myapp
# follow the README's kyte-ui section: add the dependency, the safelist, and kyte-ui.js
kyte build            # fetches kyte-ui and compiles the app
npm install           # once
npm run css:watch &   # keep Tailwind rebuilding wwwroot/index.css
./build/debug/bin/myapp --port 8099
# open http://127.0.0.1:8099/
```

The guide chapter "The kyte-ui component kit" walks through the same setup in more detail.

## Status

20 components: 16 presentational (`Button`, `Badge`, `Alert`, `Card`, `Field`, `Input`,
`Select`, `Textarea`, `Checkbox`, `Radio`, `Toast`, `Disclosure`, `Modal`, `Spinner`,
`Divider`, `Avatar`) and 4 interactive widgets (`TreeView`, `Dropdown`, `Tabs`, `Menu`).
Typed `Tone` and `Size` variants, an optional `cls` override on every component, and
cross-module usage via qualified tags. TreeView, Dropdown, and Disclosure are no-JS native
`<details>`; Tabs, Menu, Modal (reopen), and Toast (dismiss) are enhanced by the optional
`kyte-ui.js`. Every component ships `dark:` variants for a full dark theme (Tailwind `class`
strategy). Scaffold a web app with `kyte init web`, add kyte-ui per its README, to see them in a
running app.
