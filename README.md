# GamePro Master

GamePro Master is a free, open-source Shopify Online Store 2.0 theme for gaming accessories and electronics stores. Its visual language is editorial and product-first: a rounded white storefront canvas, dark outer frame, large product imagery, clear collection cards, and focused conversion surfaces.

The bundled generic catalog is placeholder content. Replace it with your own Shopify collection and product selections in the theme editor before publishing.

## Features

- JSON templates for home, product, collection, cart, search, pages, contact, 404, collections, blog, and article views
- Theme-editor sections for hero, categories, featured product, product grid, trust messaging, and newsletter
- Product form, cart page, collection sorting, recommendations, search, contact form, and policy links
- Responsive Concept-inspired electronics storefront design
- Optional generic demo catalog that can be disabled in the theme editor
- MIT license and GitHub Actions Theme Check workflow

## Quick Start

Install the latest Shopify CLI, clone the theme, then preview it against a development store:

```bash
git clone https://github.com/your-org/gamepro-master.git
cd gamepro-master
shopify theme dev --store=your-store.myshopify.com
```

To upload a distributable copy:

```bash
shopify theme push --unpublished
```

## Customize

In the Shopify theme editor:

1. Select a hero image and edit the hero copy.
2. Choose a Shopify product in `Featured product`.
3. Choose a Shopify collection in `Product grid`.
4. Disable the generic demo fallback after your catalog is connected.
5. Configure navigation menus, policy pages, and social links.

## Architecture

```text
assets/       CSS, JavaScript, SVG, and demo images
config/       Global theme settings
layout/       Storefront shell
locales/      Theme translations
sections/     Merchant-configurable page modules
snippets/     Reusable Liquid fragments
templates/    JSON page templates
docs/         Review notes and roadmap
```

## Development

Run Shopify Theme Check before opening a pull request:

```bash
shopify theme check
```

The theme intentionally uses server-rendered Liquid for storefront content and JavaScript only for progressive enhancement.

## Demo Assets

The repository intentionally excludes branded product images. Original AI-generated controller imagery keeps the first preview useful without redistributing third-party product assets.

## Project Status

The storefront foundation is usable, but the project is still pre-`1.0`. See [docs/ROADMAP.md](docs/ROADMAP.md) for the remaining work before a stable public release.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) first.

## License

Theme code is available under the [MIT License](LICENSE). Demo product imagery may have separate rights requirements.
