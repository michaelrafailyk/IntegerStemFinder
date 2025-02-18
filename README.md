A tool for planning weight interpolation and finding the closest integer (or closest to integer) stem or sidebearing. Features: interpolate and extrapolate; switch instance to master and vice versa; hide unnecessary weights; drag weight along the axis; adjust instance after interpolation; find a closest integer stem or sidebearing; switch between accurate and rounded values; see a visualization of stems and sidebearings; compare interpolation strategies using sets.

The progression formulas are taken from a [comment of Linus Romer](https://typedrawers.com/discussion/comment/34545/#Comment_34545) on TypeDrawers. The idea of editable instances is inspired by a [comment of Abraham Lee](https://typedrawers.com/discussion/comment/43398/#Comment_43398). The idea of finding the closest integer stem or sidebearing is inspired by a [comment of George Thomas](https://typedrawers.com/discussion/comment/2754/#Comment_2754).

Online version: [michaelrafailyk.github.io/IntegerStemFinder](https://michaelrafailyk.github.io/IntegerStemFinder/)

Video demonstration: [youtube.com/watch?v=yZbrtoCHoXE](https://www.youtube.com/watch?v=yZbrtoCHoXE)

![IntegerStemFinder preview](https://repository-images.githubusercontent.com/934969198/5a471259-8686-4439-8f21-5781f67df29c)

## Features

- Interpolate linearly (`Equal`). For extreme masters with any stems (including zero or negative).
- Interpolate with a progression (`Impallari`, `Schneider`, `Luc(as)`, `Abraham`). Only for extreme masters with positive stems.
- Interpolate from master to master (`Segments`) with a multiple masters option. Stems or sidebearings are not required, but if set, they can contain any numerical value (positive, zero, negative).
- Extrapolate outside of masters (`Segments`). If the extrapolated instances do not fit on the axis, the extrapolated area will be limited to the extreme axis position, as if there is an invisible master. Axis range is from 0 to 1000.

- Adjust the instance position after interpolation. Interpolated instances are green, and adjusted instances are blue.
- Switch any weight to master or instance by clicking the `Master`/`Instance` button.
- Hide any weight from axis by clicking the `Hide` button. This way you can control number of weights on the axis. Hidden weights do not participate in interpolation.

- Move the weight position by entering the value into the `position field`.
- Move the weight position one division forward/back by clicking `+`/`-` buttons under the position field.
- Move the weight position by dragging its `handle`/`line`. Master movement is less restrictive. Instance movement is restricted by the range between surrounding weights. To prevent the weights from collapsing, there are bumpers 2% of the axis length.
- Move the stem by entering the value into the `stem field`. The corresponding position and sidebearing will be calculated to match the new stem.
- Move the stem one stem forward/back by clicking `+`/`-` buttons above the stem field.
- Move the sidebearing by entering the value into the `sidebearing field`. The corresponding position and stem will be calculated to match the new sidebearing.
- All the fields are editable for masters (and for instances, if contain values).

- Save the current axis state to a set by clicking the `Save set` button. This way you can compare your interpolation strategies without losing any adjustments. Six different sets can be saved. Sets are names after letters of the Greek alphabet. Any set can be removed by clicking the `x` button next to the set name.

- Move the weight to front by clicking on it anywhere. It can be useful if the weights are positioned too close and overlap each other.
- Switch from accurate (two decimal places) to rounded stems and sidebearings by clicking the `Rounded` button.
- See a visualization of the stem thickness with a sidebearings around it, under the weight.
- Predefine default weights and its parameters in an array in a JavaScript file. Here you can set default axis configuration, such as: amount of weights on axis; weight position and name; weight is master, instance, or hidden; stem and sidebearing values for masters.
