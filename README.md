# A more advanced theme template

This uses **your own** class map - more info on how it works [here][steam-theming-utils].

## Example

Let's say you have a file called `src/desktop/titlebarcontrols.css`:

```css
/* Remove useless shit */
#AnnouncementsButton,
#GamepadUIToggle {
  display: none;
}
```

It will be compiled to the following code residing in `dist/desktop/titlebarcontrols.css`:

```css
/* Remove useless shit */
._5wILZhsLODVwGfcJ0hKmJ /* AnnouncementsButton */,
._3LKQ3S_yqrebeNLF6aeiog /* GamepadUIToggle */ {
  display: none;
}
```

This example resides in the `src` directory. The files whose class names will be replaced will reside in the `dist` directory.

## Usage

```sh
# Install dependencies
$ npm i

# See the readable versions of classes
$ npx steam-theming-utils make_readable_classes

# ...and build!
$ npm run build
```

[Biome][biome], a CSS/JS formatter/linter, and [PostCSS][postcss] are also included as dependencies of [steam-theming-utils][steam-theming-utils].

[biome]: https://biomejs.dev
[postcss]: https://postcss.org
[steam-theming-utils]: https://github.com/ricewind012/steam-theming-utils
