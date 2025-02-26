## IntegerStemFinder

A tool for planning weight interpolation or extrapolation, with the ability to adjust instances after interpolation and to easily find the closest integer (or closest to integer if decimal) stem or sidebearing. Features: interpolate and extrapolate; switch any weight to master; hide any weight from axis; drag the weight to change its position; adjust instance after interpolation; find a closest integer stem or sidebearing; switch between accurate and rounded values; see a visualization of stems and sidebearings; compare interpolation strategies using sets.

## Links

Online version: [michaelrafailyk.github.io/IntegerStemFinder](https://michaelrafailyk.github.io/IntegerStemFinder/)

Download for offline use: [github.com/michaelrafailyk/IntegerStemFinder/archive/refs/heads/main.zip](https://github.com/michaelrafailyk/IntegerStemFinder/archive/refs/heads/main.zip)

Video demonstration: [youtube.com/watch?v=ei9jeOwSu30](https://www.youtube.com/watch?v=ei9jeOwSu30)

## Preview

![IntegerStemFinder preview](https://repository-images.githubusercontent.com/934969198/a7587405-8b05-4021-97e6-a82fc62c4a7f)

## Sources

- The idea of editable instances is inspired by a [comment of Abraham Lee](https://typedrawers.com/discussion/comment/43398/#Comment_43398) on TypeDrawers.
- The idea of finding the closest integer stem or sidebearing is inspired by a [comment of George Thomas](https://typedrawers.com/discussion/comment/2754/#Comment_2754).
- The progression formulas are taken from a [comment of Linus Romer](https://typedrawers.com/discussion/comment/34545/#Comment_34545) and from a [comment of Abraham Lee](https://typedrawers.com/discussion/comment/26280/#Comment_26280).
- Interpolation of nonlinear progression with intermediate masters uses the second method from a [comment of John Hudson](https://typedrawers.com/discussion/comment/68492/#Comment_68492).

## Features

- Interpolate from master to master (`Linear`) with a multiple masters option. Stems or sidebearings are not required, but if set, they can contain any numerical value (positive, zero, negative).
- Extrapolate outside of masters (`Linear`) with a multiple masters option. If the extrapolated instances do not fit on the axis, the extrapolated segments will be limited to the extreme axis position (as if there is an invisible master). Axis range is from 0 to 1000.
- Interpolate with equal steps between all weights (`Equal`). For extreme masters with any stems set (positive, zero, negative).
- Interpolate with a progression (`Impallari`, `Schneider`, `Luc(as)`, `Abraham`) with a multiple masters option. Extreme masters should have stems with positive values. Last master stem should be bigger of the first master stem. If intermediate master stem is out of extreme masters stems range, this master will be turned to instance.

- Adjust the instance position after interpolation. Interpolated instances are green, and adjusted instances are blue.
- Switch any weight to master or instance by clicking the `Master` / `Instance` button. Master weights are black.
- Hide any weight from axis by clicking the `Hide` button. This way you can control number of weights on the axis. Hidden weights do not participate in interpolation. Hidden weights are gray.

- Move the weight position by entering the value into the `position field`.
- Move the weight position one division forward/back by clicking `+` / `-` buttons under the position field.
- Move the weight position by dragging its `handle` / `line`. Master movement is less restrictive. Instance movement is restricted by the range between surrounding weights. To prevent the weights from collapsing, there are bumpers 2% of the axis length.
- Move the stem by entering the value into the `stem field`. The corresponding position and sidebearing will be calculated to match the new stem.
- Move the stem one stem forward/back by clicking `+` / `-` buttons above the stem field.
- Move the sidebearing by entering the value into the `sidebearing field`. The corresponding position and stem will be calculated to match the new sidebearing.
- All the fields are editable for masters (and for instances, if contain values).

- Save the current axis state to a set by clicking the `Save set` button. This way you can compare your interpolation strategies without losing any adjustments. Six different sets can be saved. Sets are names after letters of the Greek alphabet. Any set can be removed by clicking the `x` button next to the set name.

- Bring weight visually to front by clicking on it anywhere. It can be useful if the weights are positioned too close and overlap each other.
- Switch from accurate (two decimal places) to rounded stems and sidebearings by clicking the `Rounded` button.
- See a visualization of the stem thickness with a sidebearings around it, under the weight.
- Predefine default weights and its parameters in an array in a JavaScript file. Here you can set default axis configuration, such as: amount of weights on axis; weight position and name; weight is master, instance, or hidden; stem and sidebearing values for masters.

``` js
defaults: [
	{position: 0, name: 'Hairline', hidden: true},
	{position: 100, name: 'Thin', master: true, stem: 20, sidebearing: 82},
	{position: 200, name: 'Extra Light'},
	{position: 300, name: 'Light'},
	{position: 400, name: 'Regular'},
	{position: 500, name: 'Medium'},
	{position: 600, name: 'Semi Bold'},
	{position: 700, name: 'Bold'},
	{position: 800, name: 'Extra Bold'},
	{position: 900, name: 'Black', master: true, stem: 220, sidebearing: 50}
]
```

## Colors

- Black – master
- Green – instance
- Blue – adjusted instance
- Gray – hidden weight
