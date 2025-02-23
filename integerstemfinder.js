/*

	IntegerStemFinder v1.0.4
	Licensed under the MIT License
	Developed by Michael Rafailyk in 2025
	https://github.com/michaelrafailyk/IntegerStemFinder

*/

let axis = {



	weights: {
		defaults: [
			{position: 0, name: 'Hairline', hidden: true},
			{position: 100, name: 'Thin', master: true, stem: 20},
			{position: 200, name: 'Extra Light'},
			{position: 300, name: 'Light'},
			{position: 400, name: 'Regular'},
			{position: 500, name: 'Medium'},
			{position: 600, name: 'Semi Bold'},
			{position: 700, name: 'Bold'},
			{position: 800, name: 'Extra Bold'},
			{position: 900, name: 'Black', master: true, stem: 220}
		],
		all: [],
		visible: [],
		router: {},
		masters: [],
		onlyextrememasters: false,
		rounded: false
	},



	build: function() {
		// copy weight model to build all weights
		let model = document.querySelector('.weight');
		for (let i = 1; i < axis.weights.defaults.length; i++) {
			let element = model.cloneNode(true);
			model.parentElement.appendChild(element);
		}
		// update all weights list
		axis.weights.all = document.getElementsByClassName('weight');
		// update visible weights list and make a map for routing all to visible
		axis.routing();
	},



	setup: function() {
		
		// build all weights
		axis.build();
		
		// set defaults and add events
		for (let i = 0; i < axis.weights.all.length; i++) {
			
			// defaults
			// set default values
			let name = axis.weights.all[i].querySelector('.weight-name');
			let position = axis.weights.all[i].querySelector('.weight-position');
			let stem = axis.weights.all[i].querySelector('.weight-stem');
			let sidebearing = axis.weights.all[i].querySelector('.weight-sidebearing');
			name.textContent = axis.weights.defaults[i].name;
			axis.weights.all[i].style.left = axis.weights.defaults[i].position / 10 + '%';
			position.value = axis.weights.defaults[i].position;
			if (axis.weights.defaults[i].master && axis.weights.defaults[i].stem) {
				stem.value = axis.weights.defaults[i].stem;
			}
			if (axis.weights.defaults[i].master && axis.weights.defaults[i].sidebearing) {
				sidebearing.value = axis.weights.defaults[i].sidebearing;
			}
			
			// position
			// enter position value manually
			position.addEventListener('focus', function() {
				// save last known position
				position.setAttribute('data-position-lastknown', position.value);
			});
			// leave position field – apply entered number if it was changed
			position.addEventListener('blur', function() {
				if (position.value !== position.getAttribute('data-position-lastknown')) {
					let percent = Number(position.value) / 10;
					// check position in limiter
					if (position.value && percent === axis.limiter(i, percent)) {
						axis.weights.all[i].style.left = Number(position.value) / 10 + '%';
						position.setAttribute('data-position-lastknown', position.value);
						// master – interpolate
						if (axis.weights.all[i].classList.contains('master')) {
							axis.interpolation();
						}
						// instance – adjust
						else {
							axis.adjustment(i, percent);
						}
					}
					// restore last known position if entered position is outside of limiter range
					else {
						position.value = position.getAttribute('data-position-lastknown');
					}
				}
				position.removeAttribute('data-position-lastknown');
			});
			// enter key pressing
			position.addEventListener('keydown', function(e) {
				let key = e.key || e.keyCode;
				if (key === 'Enter' || key === 13) {
					position.blur();
				}
			});
			// position buttons
			// move one position left by pressing minus button
			let position_minus = axis.weights.all[i].querySelector('.weight-position-minus');
			position_minus.addEventListener('click', function() {
				let percent = (Math.round((Number(axis.weights.all[i].style.left.replace('%', ''))) * 10) / 10) - 0.1;
				// check position in limiter
				if (percent === axis.limiter(i, percent)) {
					axis.weights.all[i].style.left = percent + '%';
					position.value = Number(position.value) - 1;
					// master – interpolate
					if (axis.weights.all[i].classList.contains('master')) {
						axis.interpolation();
					}
					// instance – adjust
					else {
						axis.adjustment(i, percent);
					}
				}
			});
			// move one position right by pressing plus button
			let position_plus = axis.weights.all[i].querySelector('.weight-position-plus');
			position_plus.addEventListener('click', function() {
				let percent = (Math.round((Number(axis.weights.all[i].style.left.replace('%', ''))) * 10) / 10) + 0.1;
				// check position in limiter
				if (percent === axis.limiter(i, percent)) {
					axis.weights.all[i].style.left = percent + '%';
					position.value = Number(position.value) + 1;
					// master – interpolate
					if (axis.weights.all[i].classList.contains('master')) {
						axis.interpolation();
					}
					// instance – adjust
					else {
						axis.adjustment(i, percent);
					}
				}
			});
			// drag position
			// drag position by moving the handler
			let axis_box = document.getElementsByClassName('axis')[0];
			let axis_box_rect = null;
			let percent_prev = null;
			let position_drag_start = null;
			let position_drag_active = false;
			let position_drag = axis.weights.all[i].querySelector('.weight-handler');
			let position_move = function(x) {
				let percent = ((x - axis_box_rect.left) * 100) / (axis_box_rect.right - axis_box_rect.left);
				percent = Math.round(percent * 10) / 10;
				// do nothing if new position is equal to prev
				if (percent == percent_prev) {
					return;
				} else {
					percent_prev = percent;
				}
				// correct position in limiter
				percent = axis.limiter(i, percent);
				axis.weights.all[i].style.left = percent + '%';
				position.value = Math.round(percent * 10);
				// master – interpolate
				if (axis.weights.all[i].classList.contains('master')) {
					axis.interpolation();
				}
				// instance – adjust
				else {
					axis.adjustment(i, percent);
				}
			};
			// drag position mouse events
			position_drag.addEventListener('mousedown', function(e) {
				// prohibit right click
				if (e.which === 3 || e.button === 2) {
					return false;
				}
				position_drag_active = true;
				position_drag_start = -(e.clientX - axis.weights.all[i].getBoundingClientRect().left);
				axis_box_rect = axis_box.getBoundingClientRect();
			});
			axis_box.addEventListener('mousemove', function(e) {
				if (position_drag_active) {
					position_move(e.clientX + position_drag_start);
				};
			});
			axis_box.addEventListener('mouseup', function() {
				if (position_drag_active) {
					position_drag_active = false;
					axis_box_rect = null;
				}
			});
			axis_box.addEventListener('mouseleave', function() {
				if (position_drag_active) {
					let position_drag_leave = function(e) {
						position_drag_active = false;
						axis_box_rect = null;
						document.body.removeEventListener('mouseup', position_drag_leave);
						window.removeEventListener('blur', position_drag_leave);
						e.preventDefault();
					}
					document.body.addEventListener('mouseup', position_drag_leave);
					window.addEventListener('blur', position_drag_leave);
				}
			});
			// drag position touch events
			position_drag.addEventListener('touchstart', function(e) {
				position_drag_active = true;
				position_drag_start = -(e.changedTouches[0].screenX - axis.weights.all[i].getBoundingClientRect().left);
				axis_box_rect = axis_box.getBoundingClientRect();
				e.preventDefault();
			}, false);
			axis_box.addEventListener('touchmove', function(e) {
				if (position_drag_active) {
					position_move(e.changedTouches[0].screenX + position_drag_start);
					e.preventDefault();
				}
			}, false);
			axis_box.addEventListener('touchend', function() {
				if (position_drag_active) {
					position_drag_active = false;
					axis_box_rect = null;
				}
			});
			axis_box.addEventListener('touchcancel', function() {
				if (position_drag_active) {
					position_drag_active = false;
					axis_box_rect = null;
				}
			});
			
			// stem
			// enter stem value manually
			stem.addEventListener('focus', function() {
				// save last known stem
				stem.setAttribute('data-stem-lastknown', stem.value);
			});
			// leave stem field – apply entered number if it was changed
			stem.addEventListener('blur', function() {
				if (stem.value !== stem.getAttribute('data-stem-lastknown')) {
					// master – interpolate
					if (axis.weights.all[i].classList.contains('master')) {
						axis.progressions.equalchecker();
						axis.interpolation();
					}
					// instance – adjust
					else {
						if (stem.value) {
							// find and set integer position and stem that is integer or closest to it
							axis.integerfinder(i, 'stem', false);
						} else {
							// restore last known stem if it is instance and value is empty
							stem.value = stem.getAttribute('data-stem-lastknown');
						}
					}
				}
				stem.removeAttribute('data-stem-lastknown');
			});
			// enter key pressing
			stem.addEventListener('keydown', function(e) {
				let key = e.key || e.keyCode;
				if (key === 'Enter' || key === 13) {
					stem.blur();
				}
			});
			// stem buttons
			// only for instances
			// move weight to previous closest integer stem
			let stem_minus = axis.weights.all[i].querySelector('.weight-stem-minus');
			stem_minus.addEventListener('click', function() {
				if (stem.value.length) {
					axis.integerfinder(i, 'stem', 'prev');
				}
			});
			// move weight to next closest integer stem
			let stem_plus = axis.weights.all[i].querySelector('.weight-stem-plus');
			stem_plus.addEventListener('click', function() {
				if (stem.value.length) {
					axis.integerfinder(i, 'stem', 'next');
				}
			});
			
			// sidebearing
			// enter sidebearing value manually
			sidebearing.addEventListener('focus', function() {
				// save last known sidebearing
				sidebearing.setAttribute('data-sidebearing-lastknown', sidebearing.value);
			});
			// leave sidebearing field – apply entered number if it was changed
			sidebearing.addEventListener('blur', function() {
				if (sidebearing.value !== sidebearing.getAttribute('data-sidebearing-lastknown')) {
					// master – interpolate
					if (axis.weights.all[i].classList.contains('master')) {
						axis.interpolation();
					}
					// instance – adjust
					else {
						if (sidebearing.value) {
							// find and set integer position and sidebearing that is integer or closest to it
							axis.integerfinder(i, 'sidebearing', false);
						} else {
							// restore last known sidebearing if it is instance and value is empty
							sidebearing.value = sidebearing.getAttribute('data-sidebearing-lastknown');
						}
					}
				}
				sidebearing.removeAttribute('data-sidebearing-lastknown');
			});
			// enter key pressing
			sidebearing.addEventListener('keydown', function(e) {
				let key = e.key || e.keyCode;
				if (key === 'Enter' || key === 13) {
					sidebearing.blur();
				}
			});
			
			// master
			// toggle instance to master and vice versa
			let master = axis.weights.all[i].querySelector('.weight-master');
			master.addEventListener('click', function() {
				// make master
				if (!axis.weights.all[i].classList.contains('master')) {
					axis.weights.all[i].classList.remove('instance');
					axis.weights.all[i].classList.add('master');
					if (axis.weights.all[i].classList.contains('adjusted')) {
						axis.weights.all[i].classList.remove('adjusted');
					}
					// enable stem and sidebearing input for master
					stem.disabled = false;
					sidebearing.disabled = false;
					stem.parentElement.classList.remove('weight-stemsidebearing-hidden');
					sidebearing.parentElement.classList.remove('weight-stemsidebearing-hidden');
					// round inputs values for master – like a type design application does?
					if (stem.value.length) {
						stem.value = Math.round(Number(stem.value));
					}
					if (sidebearing.value.length) {
						sidebearing.value = Math.round(Number(sidebearing.value));
					}
					// remove instance attributes
					if (axis.weights.all[i].hasAttribute('data-stem-extreme')) {
						axis.weights.all[i].removeAttribute('data-stem-extreme');
					}
					if (axis.weights.all[i].hasAttribute('data-sidebearing-extreme')) {
						axis.weights.all[i].removeAttribute('data-sidebearing-extreme');
					}
					// turn off active progression
					if (axis.progressions.active) {
						axis.progressions.highlight();
					}
				}
				// make instance
				else {
					axis.weights.all[i].classList.remove('master');
					axis.weights.all[i].classList.add('instance');
				}
				// update list of masters
				axis.weights.masters = [];
				for (let i = 0; i < axis.weights.visible.length; i++) {
					if (axis.weights.visible[i].classList.contains('master')) {
						axis.weights.masters.push(i);
					}
				}
				// if there are less than two masters
				if (axis.weights.masters.length < 2) {
					// clear stem and sidebearings for all instances
					for (let i = 0; i < axis.weights.all.length; i++) {
						if (!axis.weights.all[i].classList.contains('master')) {
							axis.weights.all[i].querySelector('.weight-stem').value = '';
							axis.weights.all[i].querySelector('.weight-sidebearing').value = '';
							axis.weights.all[i].querySelector('.weight-stem').disabled = true;
							axis.weights.all[i].querySelector('.weight-sidebearing').disabled = true;
							axis.weights.all[i].querySelector('.weight-stem').parentElement.classList.add('weight-stemsidebearing-hidden');
							axis.weights.all[i].querySelector('.weight-sidebearing').parentElement.classList.add('weight-stemsidebearing-hidden');
							if (axis.weights.all[i].hasAttribute('data-stem-extreme')) {
								axis.weights.all[i].removeAttribute('data-stem-extreme');
							}
							if (axis.weights.all[i].hasAttribute('data-sidebearing-extreme')) {
								axis.weights.all[i].removeAttribute('data-sidebearing-extreme');
							}
						}
						// hide stem minus/plus buttons
						let stem = axis.weights.all[i].querySelector('.weight-stem');
						let stem_minus = axis.weights.all[i].querySelector('.weight-stem-minus');
						let stem_plus = axis.weights.all[i].querySelector('.weight-stem-plus');
						if (!stem_minus.classList.contains('weight-stem-minusplus-hide')) {
							stem_minus.classList.add('weight-stem-minusplus-hide');
						}
						if (!stem_plus.classList.contains('weight-stem-minusplus-hide')) {
							stem_plus.classList.add('weight-stem-minusplus-hide');
						}
					}
					// last master toggled to instance – hide its visualization
					if (axis.weights.masters.length == 0) {
						let visualization_stem = axis.weights.all[i].querySelector('.visualization-stem');
						let visualization_sidebearing = axis.weights.all[i].querySelector('.visualization-sidebearing');
						if (!visualization_stem.classList.contains('visualization-hide')) {
							visualization_stem.classList.add('visualization-hide');
						}
						if (!visualization_sidebearing.classList.contains('visualization-hide')) {
							visualization_sidebearing.classList.add('visualization-hide');
						}
					}
				}
				axis.onlyextrememasters();
				axis.progressions.equalchecker();
				axis.interpolation();
			});
			// set masters specified in defaults
			if (axis.weights.defaults[i].master) {
				master.click();
			}
			
			// highlighted
			// move selected weight to front visually (z-index up)
			// it can be useful if the weights are positioned too close and overlap each other
			let highlight = function() {
				if (!axis.weights.all[i].classList.contains('highlight') && !axis.weights.all[i].classList.contains('hidden')) {
					axis.weights.all[i].classList.add('highlight');
					for (j = 0; j < axis.weights.all.length; j++) {
						if (j !== i && axis.weights.all[j].classList.contains('highlight')) {
							axis.weights.all[j].classList.remove('highlight');
						}
					}
				}
			};
			axis.weights.all[i].addEventListener('mousedown', highlight);
			axis.weights.all[i].addEventListener('touchstart', highlight);
			
			// hidden
			// temporary hide weight from axis
			// hidden weight do not participate in interpolation
			let hide = axis.weights.all[i].querySelector('.weight-hide');
			hide.addEventListener('click', function() {
				let correction_required = false;
				// hide
				if (!axis.weights.all[i].classList.contains('hidden')) {
					// only if there are more than 3 weights visible
					if (axis.weights.visible.length > 3) {
						axis.weights.all[i].classList.add('hidden');
						// clean up to default
						if (axis.weights.all[i].classList.contains('master')) {
							master.click();
						}
						axis.weights.all[i].style.left = (axis.weights.defaults[i].position / 10) + '%';
						axis.weights.all[i].querySelector('.weight-position').value = axis.weights.defaults[i].position;
						axis.weights.all[i].querySelector('.weight-stem').value = '';
						axis.weights.all[i].querySelector('.weight-sidebearing').value = '';
						if (axis.weights.all[i].hasAttribute('data-position-interpolated')) {
							axis.weights.all[i].removeAttribute('data-position-interpolated');
						}
						if (axis.weights.all[i].hasAttribute('data-stem-extreme')) {
							axis.weights.all[i].removeAttribute('data-stem-extreme');
						}
						if (axis.weights.all[i].hasAttribute('data-sidebearing-extreme')) {
							axis.weights.all[i].removeAttribute('data-sidebearing-extreme');
						}
					} else {
						return;
					}
				}
				// unhide
				else {
					axis.weights.all[i].classList.remove('hidden');
					correction_required = true;
				}
				// update visible weights list and make a map for routing all weights to visible weights
				axis.routing();
				// check and update only extreme masters parameter
				axis.onlyextrememasters();
				// interpolate or adjust
				if (axis.weights.masters.length > 0) {
					// interpolate (position only) if at least 1 master is visible
					axis.interpolation();
				} else if (correction_required) {
					// adjust unhidden instance position if it appears in a wrong order/place
					let percent = axis.weights.defaults[i].position / 10;
					percent = axis.limiter(i, percent);
					if (percent < 0) {
						percent = 0;
					} else if (percent > 100) {
						percent = 100;
					}
					if (axis.weights.all[i - 1] && axis.weights.all[i + 1] && !axis.weights.all[i - 1].classList.contains('hidden') && !axis.weights.all[i + 1].classList.contains('hidden')) {
						// if too close to prev or next weight – arrange instance position between them
						let percent_prev = Math.round(Number(axis.weights.all[i - 1].style.left.replace('%', '')) * 10) / 10;
						let percent_next = Math.round(Number(axis.weights.all[i + 1].style.left.replace('%', '')) * 10) / 10;
						if ((percent + 2) > percent_next || (percent - 2) < percent_prev) {
							percent = ((percent_next - percent_prev) / 2) + percent_prev;
						}
					}
					axis.weights.all[i].style.left = percent + '%';
					position.value = Math.round(percent * 10);
					for (let j = 0; j < axis.weights.visible.length; j++) {
						let percent_to_compare = Math.round(Number(axis.weights.visible[j].style.left.replace('%', '')) * 10) / 10;
						if (percent === percent_to_compare && axis.weights.all[i] !== axis.weights.visible[j]) {
							// move an instance that ocuppies extreme position, usually it's the instance after first one or instance before last one
							if (percent == 0 && j == 1) {
								let position = axis.weights.visible[j].querySelector('.weight-position');
								position.focus();
								position.value = 20;
								position.blur();
								break;
							} else if (percent == 100 && j == axis.weights.visible.length - 2) {
								let position = axis.weights.visible[j].querySelector('.weight-position');
								position.focus();
								position.value = 980;
								position.blur();
								break;
							}
						}
					}
					axis.visualization();
					highlight();
				}
			});
			// set hidden weights specified in defaults
			if (axis.weights.defaults[i].hidden) {
				hide.click();
			}
			
		// weights loop end
		}
		
		// check input text in a fields
		let fields = document.getElementsByTagName('input');
		for (let i = 0; i < fields.length; i++) {
			// allow to type numbers and press modifier keys
			fields[i].addEventListener('keydown', function(e) {
				// allow delete, backspace, tab, escape, enter, minus, ctrl/cmd+a/x/c/v, home, end, left, right, up, down
				if (e.keyCode == 46 || e.keyCode == 8 || e.keyCode == 9 || e.keyCode == 27 || e.keyCode == 13 || ((e.keyCode == 65 || e.keyCode == 67 || e.keyCode == 86 || e.keyCode == 88) && (e.ctrlKey === true || e.metaKey === true)) || (e.keyCode >= 35 && e.keyCode <= 40)) {
					return;
				// allow the minus sign (hyphen) for sidebearing fields
				} else if (e.keyCode == 189 && fields[i].classList.contains('weight-sidebearing')) {
					return;
				} else {
					// prevent non-numbers
					if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105 )) {
						e.preventDefault();
					}
				}
			});
			// input length limitations
			fields[i].addEventListener('keyup', function(e) {
				// remove double zero at the beginning
				if (fields[i].value.length > 1 && fields[i].value.substring(0, 1) == '0') {
					fields[i].value = 0;
				}
				// do not allow to type the numbers with decimals (period character)
				if (fields[i].value.indexOf('.') !== -1) {
					fields[i].value = fields[i].value.substring(0, 7);
				}
				// limit input length (with integer values) to 4 numbers
				else if (fields[i].value.length > 4) {
					fields[i].value = fields[i].value.substring(0, 4);
				}
			});
		}
		
		// rounded
		// toggle stems and sidebearings numbers from more accurate decimals to rounded integer
		let rounded = document.querySelector('.rounded');
		rounded.addEventListener('click', function() {
			// round – update the current values without interpolation
			if (!rounded.classList.contains('rounded-active')) {
				rounded.classList.add('rounded-active');
				axis.weights.rounded = true;
				let stems_sidebearings = document.querySelectorAll('.weight-stem, .weight-sidebearing');
				for (let i = 0; i < stems_sidebearings.length; i++) {
					if (stems_sidebearings[i].value.length) {
						stems_sidebearings[i].value = Math.round(stems_sidebearings[i].value);
					}
				}
			}
			// unround – reinterpolate
			else {
				rounded.classList.remove('rounded-active');
				axis.weights.rounded = false;
				axis.interpolation();
			}
		});
		
		// setup progressions and sets
		axis.progressions.setup();
		axis.sets.setup();
		
	// setup end
	},



	routing: function() {
		// update visible weights list and make a map for routing all weights to visible weights
		// this way all initially setted events (in all weights list) will work correctly (for visible weights list) by routing their index
		axis.weights.visible = [];
		axis.weights.router = {};
		let hidden_counter = 0;
		for (let i = 0; i < axis.weights.all.length; i++) {
			let router_value = i;
			if (!axis.weights.all[i].classList.contains('hidden')) {
				axis.weights.visible.push(axis.weights.all[i]);
				router_value -= hidden_counter;
			} else {
				hidden_counter++;
				router_value = 'unset';
			}
			axis.weights.router[i] = router_value;
		}
		// update list of masters
		axis.weights.masters = [];
		for (let i = 0; i < axis.weights.visible.length; i++) {
			if (axis.weights.visible[i].classList.contains('master')) {
				axis.weights.masters.push(i);
			}
		}
	},



	onlyextrememasters: function() {
		// check if only extreme weights are masters
		// or just one of extreme weights is masters, so interpolation is still possible
		let masters_first_last = axis.weights.masters.length == 2 && axis.weights.masters[0] == 0 && axis.weights.masters[axis.weights.masters.length - 1] == axis.weights.visible.length - 1;
		let masters_first = axis.weights.masters.length == 1 && axis.weights.masters[0] == 0;
		let masters_last = axis.weights.masters.length == 1 && axis.weights.masters[axis.weights.masters.length - 1] == axis.weights.visible.length - 1;
		if (masters_first_last || masters_first || masters_last) {
			axis.weights.onlyextrememasters = true;
		} else {
			axis.weights.onlyextrememasters = false;
		}
	},



	limiter: function(i, percent) {
		// route all i to visible i
		i = axis.weights.router[i];
		// set position is outside of axis range
		if (percent < 0 && i == 0) {
			return 0;
		} else if (percent > 100 && i == axis.weights.visible.length - 1) {
			return 100;
		}
		// set position is within axis range
		else {
			// bumper is a percent of how close the weights could be to each other
			let bumper = 2;
			// limit master movement – less restrictive and takes into account upcoming interpolation
			if (axis.weights.visible[i].classList.contains('master')) {
				let master_prev = 'unset';
				let master_next = 'unset';
				let weights_prev = 0;
				let weights_next = 0;
				let bumper_prev = bumper;
				let bumper_next = bumper;
				// count prev and next weights and closest masters to calculate the bumper size
				for (let j = i - 1; j >= 0; j--) {
					weights_prev++;
					if (axis.weights.visible[j].classList.contains('master')) {
						master_prev = j;
						break;
					}
				}
				for (let j = i + 1; j < axis.weights.visible.length; j++) {
					weights_next++;
					if (axis.weights.visible[j].classList.contains('master')) {
						master_next = j;
						break;
					}
				}
				bumper_prev = bumper_prev * weights_prev;
				bumper_next = bumper_next * weights_next;
				if (master_prev !== 'unset') {
					if (weights_prev > 1) {
						bumper_prev += Number(axis.weights.visible[master_prev].style.left.replace('%', ''));
					} else if (master_prev == i - 1) {
						bumper_prev = Number(axis.weights.visible[master_prev].style.left.replace('%', '')) + bumper;
					}
				} else {
					if (master_next == 'unset' && i !== 0) {
						bumper_prev += Number(axis.weights.visible[0].style.left.replace('%', ''));
					}
				}
				if (master_next !== 'unset') {
					if (weights_next > 1) {
						bumper_next = Number(axis.weights.visible[master_next].style.left.replace('%', '')) - bumper_next;
					} else if (master_next == i + 1) {
						bumper_next = Number(axis.weights.visible[master_next].style.left.replace('%', '')) - bumper;
					}
				} else {
					let next_last_percent = 100;
					if (master_prev == 'unset' && i !== axis.weights.visible.length - 1) {
						next_last_percent = Math.round(Number(axis.weights.visible[axis.weights.visible.length - 1].style.left.replace('%', '')) * 10) / 10;
					}
					bumper_next = next_last_percent - bumper_next;
				}
				// compare percent to prev and next bumper
				if (percent < bumper_prev) {
					return bumper_prev;
				} else if (percent > bumper_next) {
					return bumper_next;
				}
			}
			// limit instance movement – allow to move only between the closest instances
			else {
				if (axis.weights.visible[i-1] && (Number(axis.weights.visible[i-1].style.left.replace('%', '')) + bumper > percent)) {
					return (Math.round(Number(axis.weights.visible[i-1].style.left.replace('%', '')) * 10) / 10) + bumper;
				} else if (axis.weights.visible[i+1] && (Number(axis.weights.visible[i+1].style.left.replace('%', '')) - bumper < percent)) {
					return (Math.round(Number(axis.weights.visible[i+1].style.left.replace('%', '')) * 10) / 10) - bumper;
				}
			}
		}
		return percent;
	},



	interpolation: function() {
		// when moving master
		
		// interpolate if at least one master is visible
		if (!axis.weights.masters.length) {
			return;
		}
		// apply a progression (instead of Segments interpolation) if it's active
		if (axis.progressions.active) {
			axis.progressions.apply(axis.progressions.buttons[axis.progressions.active - 1].getAttribute('data'));
			return;
		}
		
		// the following interpolation occurs when the Segments button is highlighted
		// this is a standard master to master interpolation and extrapolation, which is how type design applications act
		// the only difference is the extrapolation case when an instances can't fit to axis range – they will be limited to axis extreme values and the extrapolated segments will be shortened
		
		// interpolation
		// between every pair of masters
		let between_masters = function(from, to) {
			// get the masters values and calculate the step for instances
			let percent_from = Math.round(Number(axis.weights.visible[from].style.left.replace('%', '')) * 10) / 10;
			let percent_to = Math.round(Number(axis.weights.visible[to].style.left.replace('%', '')) * 10) / 10;
			let percent_step = (percent_to - percent_from) / (to - from);
			let percent;
			let position;
			let stem_from;
			let stem_to;
			let stem_interpolate = false;
			let stem_value = '';
			let sidebearing_from;
			let sidebearing_to;
			let sidebearing_interpolate = false;
			let sidebearing_value = '';
			if (axis.weights.visible[from].querySelector('.weight-stem').value.length && axis.weights.visible[to].querySelector('.weight-stem').value.length) {
				stem_from = Number(axis.weights.visible[from].querySelector('.weight-stem').value);
				stem_to = Number(axis.weights.visible[to].querySelector('.weight-stem').value);
				stem_interpolate = true;
			}
			if (axis.weights.visible[from].querySelector('.weight-sidebearing').value.length && axis.weights.visible[to].querySelector('.weight-sidebearing').value.length) {
				sidebearing_from = Number(axis.weights.visible[from].querySelector('.weight-sidebearing').value);
				sidebearing_to = Number(axis.weights.visible[to].querySelector('.weight-sidebearing').value);
				sidebearing_interpolate = true;
			}
			// adjust values for every weight and apply
			let counter = 0;
			for (let i = from + 1; i < to; i++) {
				counter++;
				percent = percent_from + (percent_step * counter);
				position = Math.round(percent * 10);
				let percent_corrected = ((position - (percent_from * 10)) * 100) / ((percent_to * 10) - (percent_from * 10));
				if (stem_interpolate) {
					stem_value = Math.round((stem_from + (((stem_to - stem_from) * percent_corrected) / 100)) * 100) / 100;
					if (axis.weights.rounded) {
						stem_value = Math.round(stem_value);
					}
				}
				if (sidebearing_interpolate) {
					sidebearing_value = Math.round((sidebearing_from + (((sidebearing_to - sidebearing_from) * percent_corrected) / 100)) * 100) / 100;
					if (axis.weights.rounded) {
						sidebearing_value = Math.round(sidebearing_value);
					}
				}
				axis.weights.visible[i].style.left = percent + '%';
				axis.weights.visible[i].querySelector('.weight-position').value = position;
				axis.weights.visible[i].querySelector('.weight-stem').value = stem_value;
				axis.weights.visible[i].querySelector('.weight-sidebearing').value = sidebearing_value;
			}
		};
		
		// extrapolation
		// before the first master
		let before_first_master = function(from, to, next_master) {
			// get interpolated values and calculate extrapolation values
			let percent_to = Number(axis.weights.visible[to].style.left.replace('%', ''));
			let percent_next_master = Number(axis.weights.visible[next_master].style.left.replace('%', ''));
			let percent_from = percent_to - (((percent_next_master - percent_to) / (next_master - to)) * to);
			if (percent_from < 0) {
				percent_from = 0;
			}
			let percent;
			let position_from = percent_from * 10;
			let position_to = percent_to * 10;
			let position;
			let stem_from;
			let stem_to;
			let stem_next_master;
			let stem_interpolate = false;
			let stem_value = '';
			let sidebearing_from;
			let sidebearing_to;
			let sidebearing_next_master;
			let sidebearing_interpolate = false;
			let sidebearing_value = '';
			if (axis.weights.visible[to].querySelector('.weight-stem').value.length && axis.weights.visible[next_master].querySelector('.weight-stem').value.length) {
				stem_to = Number(axis.weights.visible[to].querySelector('.weight-stem').value);
				stem_next_master = Number(axis.weights.visible[next_master].querySelector('.weight-stem').value);
				stem_from = stem_next_master - (((stem_next_master - stem_to) * (percent_next_master - percent_from)) / (percent_next_master - percent_to));
				stem_interpolate = true;
			}
			if (axis.weights.visible[to].querySelector('.weight-sidebearing').value.length && axis.weights.visible[next_master].querySelector('.weight-sidebearing').value.length) {
				sidebearing_to = Number(axis.weights.visible[to].querySelector('.weight-sidebearing').value);
				sidebearing_next_master = Number(axis.weights.visible[next_master].querySelector('.weight-sidebearing').value);
				sidebearing_from = sidebearing_next_master - (((sidebearing_next_master - sidebearing_to) * (percent_next_master - percent_from)) / (percent_next_master - percent_to));
				sidebearing_interpolate = true;
			}
			// adjust values for every weight and apply
			for (let i = 0; i < to; i++) {
				percent = percent_from + ((i * (percent_to - percent_from)) / to);
				position = Math.round(percent * 10);
				let percent_corrected = ((position - position_from) * 100) / (position_to - position_from);
				if (percent_corrected < 0) {
					percent_corrected = 0;
				}
				if (stem_interpolate) {
					stem_value = Math.round((stem_from + (((stem_to - stem_from) * percent_corrected) / 100)) * 100) / 100;
					if (axis.weights.rounded) {
						stem_value = Math.round(stem_value);
					}
				}
				if (sidebearing_interpolate) {
					sidebearing_value = Math.round((sidebearing_from + (((sidebearing_to - sidebearing_from) * percent_corrected) / 100)) * 100) / 100;
					if (axis.weights.rounded) {
						sidebearing_value = Math.round(sidebearing_value);
					}
				}
				axis.weights.visible[i].style.left = percent + '%';
				axis.weights.visible[i].querySelector('.weight-position').value = position;
				axis.weights.visible[i].querySelector('.weight-stem').value = stem_value;
				axis.weights.visible[i].querySelector('.weight-sidebearing').value = sidebearing_value;
				// save extreme stem and sidebearing for the adjustment function calculation
				// it's like one more invisible weight is there before the first visible weight
				if (i === 0) {
					if (stem_interpolate) {
						let stem_extreme = Math.round((stem_from - ((stem_to - stem_from) / to)) * 100) / 100;
						if (axis.weights.rounded) {
							stem_extreme = Math.round(stem_extreme);
						}
						axis.weights.visible[i].setAttribute('data-stem-extreme', stem_extreme);
					} else {
						if (axis.weights.visible[i].hasAttribute('data-stem-extreme')) {
							axis.weights.visible[i].removeAttribute('data-stem-extreme');
						}
					}
					if (sidebearing_interpolate) {
						let sidebearing_extreme = Math.round((sidebearing_from - ((sidebearing_to - sidebearing_from) / to)) * 100) / 100;
						if (axis.weights.rounded) {
							sidebearing_extreme = Math.round(sidebearing_extreme);
						}
						axis.weights.visible[i].setAttribute('data-sidebearing-extreme', sidebearing_extreme);
					} else {
						if (axis.weights.visible[i].hasAttribute('data-sidebearing-extreme')) {
							axis.weights.visible[i].removeAttribute('data-sidebearing-extreme');
						}
					}
				}
			}
		};
		
		// extrapolation
		// after the last master
		let after_last_master = function(from, to, prev_master) {
			// get interpolated values and calculate extrapolation values
			let percent_prev_master = Number(axis.weights.visible[prev_master].style.left.replace('%', ''));
			let percent_from = Number(axis.weights.visible[from].style.left.replace('%', ''));
			let percent_to = percent_from + (((percent_from - percent_prev_master) / (from - prev_master)) * (to - from));
			if (percent_to > 100) {
				percent_to = 100;
			}
			let percent;
			let position_from = percent_from * 10;
			let position_to = percent_to * 10;
			let position;
			let stem_prev_master;
			let stem_from;
			let stem_to;
			let stem_interpolate = false;
			let stem_value = '';
			let sidebearing_prev_master;
			let sidebearing_from;
			let sidebearing_to;
			let sidebearing_interpolate = false;
			let sidebearing_value = '';
			if (axis.weights.visible[from].querySelector('.weight-stem').value.length && axis.weights.visible[prev_master].querySelector('.weight-stem').value.length) {
				stem_from = Number(axis.weights.visible[from].querySelector('.weight-stem').value);
				stem_prev_master = Number(axis.weights.visible[prev_master].querySelector('.weight-stem').value);
				stem_to = stem_prev_master + (((stem_from - stem_prev_master) * (percent_to - percent_prev_master)) / (percent_from - percent_prev_master));
				stem_interpolate = true;
			}
			if (axis.weights.visible[from].querySelector('.weight-sidebearing').value.length && axis.weights.visible[prev_master].querySelector('.weight-sidebearing').value.length) {
				sidebearing_from = Number(axis.weights.visible[from].querySelector('.weight-sidebearing').value);
				sidebearing_prev_master = Number(axis.weights.visible[prev_master].querySelector('.weight-sidebearing').value);
				sidebearing_to = sidebearing_prev_master + (((sidebearing_from - sidebearing_prev_master) * (percent_to - percent_prev_master)) / (percent_from - percent_prev_master));
				sidebearing_interpolate = true;
			}
			// adjust values for every weight and apply
			for (let i = from + 1; i < axis.weights.visible.length; i++) {
				percent = percent_from + (((i - from) * (percent_to - percent_from)) / (to - from));
				position = Math.round(percent * 10);
				let percent_corrected = ((position - position_from) * 100) / (position_to - position_from);
				if (percent_corrected > 100) {
					percent_corrected = 100;
				}
				if (stem_interpolate) {
					stem_value = Math.round((stem_from + (((stem_to - stem_from) * percent_corrected) / 100)) * 100) / 100;
					if (axis.weights.rounded) {
						stem_value = Math.round(stem_value);
					}
				}
				if (sidebearing_interpolate) {
					sidebearing_value = Math.round((sidebearing_from + (((sidebearing_to - sidebearing_from) * percent_corrected) / 100)) * 100) / 100;
					if (axis.weights.rounded) {
						sidebearing_value = Math.round(sidebearing_value);
					}
				}
				axis.weights.visible[i].style.left = percent + '%';
				axis.weights.visible[i].querySelector('.weight-position').value = position;
				axis.weights.visible[i].querySelector('.weight-stem').value = stem_value;
				axis.weights.visible[i].querySelector('.weight-sidebearing').value = sidebearing_value;
				// save extreme stem and sidebearing for the adjustment function calculation
				// it's like one more invisible weight is there after the last visible weight
				if (i === (axis.weights.visible.length - 1)) {
					if (stem_interpolate) {
						let stem_extreme = Math.round((stem_to + ((stem_to - stem_from) / (to - from))) * 100) / 100;
						if (axis.weights.rounded) {
							stem_extreme = Math.round(stem_extreme);
						}
						axis.weights.visible[i].setAttribute('data-stem-extreme', stem_extreme);
					} else {
						if (axis.weights.visible[i].hasAttribute('data-stem-extreme')) {
							axis.weights.visible[i].removeAttribute('data-stem-extreme');
						}
					}
					if (sidebearing_interpolate) {
						let sidebearing_extreme = Math.round((sidebearing_to + ((sidebearing_to - sidebearing_from) / (to - from))) * 100) / 100;
						if (axis.weights.rounded) {
							sidebearing_extreme = Math.round(sidebearing_extreme);
						}
						axis.weights.visible[i].setAttribute('data-sidebearing-extreme', sidebearing_extreme);
					} else {
						if (axis.weights.visible[i].hasAttribute('data-sidebearing-extreme')) {
							axis.weights.visible[i].removeAttribute('data-sidebearing-extreme');
						}
					}
				}
			}
		};
		
		// find a range of instances between each pairs of masters, as well as before first and after last master
		// first and/or last weights are masters
		// perhaps this case should be redirected to Equal interpolation at the beginning of this function
		if (axis.weights.onlyextrememasters) {
			between_masters(0, axis.weights.visible.length - 1);
		}
		// only one master is in the middle
		else if (axis.weights.masters.length == 1 && axis.weights.masters[0] !== 0 && axis.weights.masters[0] !== axis.weights.visible.length - 1) {
			between_masters(0, axis.weights.masters[0]);
			between_masters(axis.weights.masters[0], axis.weights.visible.length - 1);
		}
		// two or more masters are visible and they are not extreme masters only
		// this is what Segments interpolation intended for
		else {
			// between every pair of masters
			for (let i = 0; i < axis.weights.masters.length - 1; i++) {
				between_masters(axis.weights.masters[i], axis.weights.masters[i + 1]);
			}
			// before the first master
			if (axis.weights.masters[0] !== 0) {
				before_first_master(0, axis.weights.masters[0], axis.weights.masters[1]);
			}
			// after the last master
			if (axis.weights.masters[axis.weights.masters.length - 1] < axis.weights.visible.length - 1) {
				after_last_master(axis.weights.masters[axis.weights.masters.length - 1], axis.weights.visible.length - 1, axis.weights.masters[axis.weights.masters.length - 2]);
			}
		}
		
		for (let i = 0; i < axis.weights.all.length; i++) {
			// return default instance color if it was adjusted
			if (axis.weights.all[i].classList.contains('adjusted')) {
				axis.weights.all[i].classList.remove('adjusted');
			}
			// save interpolated position
			if (!axis.weights.all[i].classList.contains('hidden')) {
				let position = axis.weights.all[i].querySelector('.weight-position').value;
				axis.weights.all[i].setAttribute('data-position-interpolated', position);
			}
		}
		
		axis.visualization();
		axis.sets.highlight();
		
	// interpolation end
	},



	adjustment: function(i, percent) {
		// when moving instance
		
		// instance movement does not require interpolation
		// route all i to visible i
		i = axis.weights.router[i];
		
		// adjust stem and sidebearing for moved instance
		let stem = axis.weights.visible[i].querySelector('.weight-stem');
		let sidebearing = axis.weights.visible[i].querySelector('.weight-sidebearing');
		if (stem.value.length || sidebearing.value.length) {
			// find the closest pair of weights
			let weight_from;
			let weight_to;
			// instance is between the others
			if (axis.weights.visible[i - 1] && axis.weights.visible[i + 1]) {
				weight_from = i - 1;
				weight_to = i + 1;
			}
			// instance is a first visible
			else if (i == 0) {
				weight_from = i + 1;
				weight_to = i + 2;
			}
			// instance is a last visible
			else if (i == axis.weights.visible.length - 1) {
				weight_from = i - 2;
				weight_to = i - 1;
			}
			// calculate the instance position relative to closest pair of weights
			let percent_from = Math.round(Number(axis.weights.visible[weight_from].style.left.replace('%', '')) * 10) / 10;
			let percent_to = Math.round(Number(axis.weights.visible[weight_to].style.left.replace('%', '')) * 10) / 10;
			let percent_between = ((percent - percent_from) * 100) / (percent_to - percent_from);
			if (stem.value.length) {
				let stem_from = Number(axis.weights.visible[weight_from].querySelector('.weight-stem').value);
				let stem_to = Number(axis.weights.visible[weight_to].querySelector('.weight-stem').value);
				let stem_value = ((percent_between * (stem_to - stem_from)) / 100) + stem_from;
				stem_value = Math.round((stem_value) * 100) / 100;
				if (axis.weights.rounded) {
					stem_value = Math.round(stem_value);
				}
				stem.value = stem_value;
			}
			if (sidebearing.value.length) {
				let sidebearing_from = Number(axis.weights.visible[weight_from].querySelector('.weight-sidebearing').value);
				let sidebearing_to = Number(axis.weights.visible[weight_to].querySelector('.weight-sidebearing').value);
				let sidebearing_value = ((percent_between * (sidebearing_to - sidebearing_from)) / 100) + sidebearing_from;
				sidebearing_value = Math.round((sidebearing_value) * 100) / 100;
				if (axis.weights.rounded) {
					sidebearing_value = Math.round(sidebearing_value);
				}
				sidebearing.value = sidebearing_value;
			}
		}
		
		// change color of adjusted instance
		let position_adjusted = Number(axis.weights.visible[i].querySelector('.weight-position').value);
		let position_interpolated = Number(axis.weights.visible[i].getAttribute('data-position-interpolated'));
		if (position_adjusted == position_interpolated) {
			if (axis.weights.visible[i].classList.contains('adjusted')) {
				axis.weights.visible[i].classList.remove('adjusted');
			}
		} else {
			if (axis.weights.masters.length > 1 && !axis.weights.visible[i].classList.contains('adjusted')) {
				axis.weights.visible[i].classList.add('adjusted');
			}
		}
		
		// update visualizations
		axis.visualization();
		axis.sets.highlight();
		
	// adjustment end
	},



	integerfinder: function(i, main, direction) {
		// find closest prev, next, or manually entered main attribute (stem or sidebearing) where position is integer and main attribute is integer or closest to it
		
		// route all i to visible i
		i = axis.weights.router[i];
		
		// declare secondary attribute depending on what main attribute is
		let secondary;
		if (main == 'stem') {
			secondary = 'sidebearing';
		} else if (main == 'sidebearing') {
			secondary = 'stem';
		}
		
		// get instance values to operate
		let position_element = axis.weights.visible[i].querySelector('.weight-position');
		let position_interpolated = Number(axis.weights.visible[i].getAttribute('data-position-interpolated'));
		let position_old = Number(position_element.value);
		let position_new = 'unset';
		let position_prev;
		let position_next;
		let position_prev_bumper;
		let position_next_bumper;
		let position_new_percent;
		let main_element = axis.weights.visible[i].querySelector('.weight-' + main);
		let main_old = Number(main_element.value);
		if (main_element.hasAttribute('data-' + main + '-lastknown')) {
			main_old = main_element.getAttribute('data-' + main + '-lastknown');
			if (main_old.length) {
				main_old = Number(main_old);
			}
		}
		let main_target = Number(main_element.value);
		let main_closest = main_old;
		let main_temp;
		let main_prev;
		let main_next;
		let secondary_element = axis.weights.visible[i].querySelector('.weight-' + secondary);
		let secondary_old = 'unset';
		if (secondary_element.value.length) {
			secondary_old = Number(secondary_element.value);
		}
		let secondary_new = 'unset';
		let secondary_prev;
		let secondary_next;
		
		// calculate a working range and limit it with bumpers (2%) so the weights will not collapse
		// get prev and next positions, stems, and sidebearings
		// previous weight values
		if (axis.weights.visible[i - 1]) {
			position_prev = Number(axis.weights.visible[i - 1].querySelector('.weight-position').value);
			position_prev_bumper = position_prev + 20;
			main_prev = Number(axis.weights.visible[i - 1].querySelector('.weight-' + main).value);
			if (secondary_old !== 'unset') {
				secondary_prev = Number(axis.weights.visible[i - 1].querySelector('.weight-' + secondary).value);
			}
		}
		// instance is a first visible – get interpolated extreme stem and sidebearing
		else {
			position_prev = 0;
			position_prev_bumper = 0;
			// when the first instance is in zero position – it requires to reverse calculate previous position substructing next interpolated minus current interpolated
			if (axis.weights.visible[i + 1]) {
				let position_next_interpolated = Number(axis.weights.visible[i + 1].getAttribute('data-position-interpolated'));
				position_prev = position_interpolated - (position_next_interpolated - position_interpolated);
			}
			main_prev = Number(axis.weights.visible[i].getAttribute('data-' + main + '-extreme'));
			if (secondary_old !== 'unset') {
				secondary_prev = Number(axis.weights.visible[i].getAttribute('data-' + secondary + '-extreme'));
			}
		}
		// next weight values
		if (axis.weights.visible[i + 1]) {
			// instance is between the other visible weights
			position_next = Number(axis.weights.visible[i + 1].querySelector('.weight-position').value);
			position_next_bumper = position_next - 20;
			main_next = Number(axis.weights.visible[i + 1].querySelector('.weight-' + main).value);
			if (secondary_old !== 'unset') {
				secondary_next = Number(axis.weights.visible[i + 1].querySelector('.weight-' + secondary).value);
			}
		}
		// instance is a last visible – get interpolated extreme stem and sidebearing
		else {
			position_next = 1000;
			position_next_bumper = 1000;
			main_next = Number(axis.weights.visible[i].getAttribute('data-' + main + '-extreme'));
			if (secondary_old !== 'unset') {
				secondary_next = Number(axis.weights.visible[i].getAttribute('data-' + secondary + '-extreme'));
			}
		}
		
		// round the target if there is a decimal number
		// increase or reduce target value by one unit depending on a button pressed and depending on a main values growth or decline (from left to right)
		// plus or minus button is pressed
		if (direction == 'prev') {
			if (main_prev < main_next) {
				if (main_element.value.indexOf('.') !== -1) {
					main_target = Math.ceil(main_target);
				}
				main_target -= 1;
			} else if (main_prev > main_next) {
				if (main_element.value.indexOf('.') !== -1) {
					main_target = Math.floor(main_target);
				}
				main_target += 1;
			}
		} else if (direction == 'next') {
			if (main_prev < main_next) {
				if (main_element.value.indexOf('.') !== -1) {
					main_target = Math.floor(main_target);
				}
				main_target += 1;
			} else if (main_prev > main_next) {
				if (main_element.value.indexOf('.') !== -1) {
					main_target = Math.ceil(main_target);
				}
				main_target -= 1;
			}
		}
		// manual input
		else {
			if (main_element.value.indexOf('.') !== -1) {
				main_target = Math.round(main_target);
			}
		}
		
		// calculate the new position
		// it requires a step by step loop to make sure that the position is integer and the main attribute is integer (or closest to it)
		// main value on axis increase from left to right
		// it is standard case for stems that are bigger on bolder weights
		if (main_prev < main_next) {
			// target value is lower than old value
			// move left
			if (main_target < main_old && main_target > main_prev) {
				// run back until main attribute will be closest to integer
				for (let i = position_old - 1; i >= position_prev_bumper; i--) {
					position_new_percent = ((i - position_prev) * 100) / (position_next - position_prev);
					main_temp = Math.round((main_prev + ((position_new_percent * (main_next - main_prev)) / 100)) * 100) / 100;
					// if old was already closest to integer target – move target one step down
					if (i == (position_old - 1) && (main_old - main_target) <= (main_target - main_temp)) {
						main_target -= 1;
					}
					// rewrite closest on every step
					if (main_temp >= main_target) {
						position_new = i;
						main_closest = main_temp;
					}
					// stop – target is reached
					else {
						// compare who is closer to integer – positive or negative value
						if ((main_target - main_temp) < (main_closest - main_target)) {
							position_new = i;
							main_closest = main_temp;
						}
						break;
					}
				}
			}
			// target value is greater than old value
			// move right
			else if (main_target > main_old && main_target < main_next) {
				// run forward until main attribute will be closest to integer
				for (let i = position_old + 1; i <= position_next_bumper; i++) {
					position_new_percent = ((i - position_prev) * 100) / (position_next - position_prev);
					main_temp = Math.round((main_prev + ((position_new_percent * (main_next - main_prev)) / 100)) * 100) / 100;
					// if old was already closest to integer target – move target one step up
					if (i == (position_old + 1) && (main_target - main_old) <= (main_temp - main_target)) {
						main_target += 1;
					}
					// rewrite closest on every step
					if (main_temp <= main_target) {
						position_new = i;
						main_closest = main_temp;
					}
					// stop – target is reached
					else {
						// compare who is closer to integer – positive or negative value
						if ((main_temp - main_target) < (main_target - main_closest)) {
							position_new = i;
							main_closest = main_temp;
						}
						break;
					}
				}
			}
		}
		// main value on axis decrease from left to right
		// usually this case is true for sidebearings that could be smaller on bolder weights
		else if (main_prev > main_next) {
			// target value is greater than old value
			// move left
			if (main_target > main_old && main_target < main_prev) {
				// run back until main attribute will be closest to integer
				for (let i = position_old - 1; i >= position_prev_bumper; i--) {
					position_new_percent = ((i - position_prev) * 100) / (position_next - position_prev);
					main_temp = Math.round((main_prev + ((position_new_percent * (main_next - main_prev)) / 100)) * 100) / 100;
					// if old was already closest to integer target – move target one step up
					if (i == (position_old - 1) && (main_target - main_old) <= (main_temp - main_target)) {
						main_target += 1;
					}
					// rewrite closest on every step
					if (main_temp <= main_target) {
						position_new = i;
						main_closest = main_temp;
					}
					// stop – target is reached
					else {
						// compare who is closer to integer – positive or negative value
						if ((main_temp - main_target) < (main_target - main_closest)) {
							position_new = i;
							main_closest = main_temp;
						}
						break;
					}
				}
			}
			// target value is lower than old value
			// move right
			else if (main_target < main_old && main_target > main_next) {
				// run forward until main attribute will be closest to integer
				for (let i = position_old + 1; i <= position_next_bumper; i++) {
					position_new_percent = ((i - position_prev) * 100) / (position_next - position_prev);
					main_temp = Math.round((main_prev + ((position_new_percent * (main_next - main_prev)) / 100)) * 100) / 100;
					// if old was already closest to integer target – move target one step down
					if (i == (position_old + 1) && (main_old - main_target) <= (main_target - main_temp)) {
						main_target -= 1;
					}
					// rewrite closest on every step
					if (main_temp >= main_target) {
						position_new = i;
						main_closest = main_temp;
					}
					// stop – target is reached
					else {
						// compare who is closer to integer – positive or negative value
						if ((main_target - main_temp) < (main_closest - main_target)) {
							position_new = i;
							main_closest = main_temp;
						}
						break;
					}
				}
			}
		}
		
		// correct weight percent between the closest weights according to new (integer) position
		position_new_percent = ((position_new - position_prev) * 100) / (position_next - position_prev)
		
		if (axis.weights.rounded) {
			main_closest = Math.round(main_closest);
		}
		
		// calculate new secondary attribute
		if (secondary_old !== 'unset') {
			secondary_new = Math.round((secondary_prev + ((position_new_percent * (secondary_next - secondary_prev)) / 100)) * 100) / 100;
			if (axis.weights.rounded) {
				secondary_new = Math.round(secondary_new);
			}
		}
		
		// apply new values
		if (position_new !== 'unset') {
			axis.weights.visible[i].style.left = (position_new / 10) + '%';
			position_element.value = position_new;
			main_element.value = main_closest;
			if (secondary_new !== 'unset') {
				secondary_element.value = secondary_new;
			}
			// highlight adjusted instance
			if (position_new === position_interpolated) {
				if (axis.weights.visible[i].classList.contains('adjusted')) {
					axis.weights.visible[i].classList.remove('adjusted');
				}
			} else {
				if (!axis.weights.visible[i].classList.contains('adjusted')) {
					axis.weights.visible[i].classList.add('adjusted');
				}
			}
			// update visualizations
			axis.visualization();
		}
		// do nothing if new position (for set main attribute) is out of range (of bumpers or axis)
		else {
			// return last known main attribute value if it was entered manually
			if (!direction) {
				main_element.value = main_old;
			}
		}
		
	// integerfinder end
	},



	visualization: function() {
		// a vertical column under each weight that display stem thickness and sidebearing size around it
		// sidebearing size is linked to stem value so they are always truthful visually
		
		// find thinnest and thickest stems and their positions in all weights list
		let stem_thinnest = 'unset';
		let stem_thickest = 'unset';
		let stem_thinnest_i;
		let stem_thickest_i;
		for (let i = 0; i < axis.weights.all.length; i++) {
			if (!axis.weights.all[i].classList.contains('hidden')) {
				let stem = axis.weights.all[i].querySelector('.weight-stem').value;
				if (stem.length) {
					stem = Number(stem);
					if (stem_thinnest == 'unset') {
						stem_thinnest = stem;
						stem_thinnest_i = i;
					} else if (stem < stem_thinnest) {
						stem_thinnest = stem;
						stem_thinnest_i = i;
					}
					if (stem_thickest == 'unset') {
						stem_thickest = stem;
						stem_thickest_i = i;
					} else if (stem > stem_thickest || (stem == stem_thinnest && stem == stem_thickest)) {
						stem_thickest = stem;
						stem_thickest_i = i;
					}
				}
			}
		}
		
		// adjust thinnest and thickest stem values for special cases
		// so visualized stems widths will be in visual harmony with its weight names even after hidding extreme weights
		// at least one stem is set
		if (stem_thinnest !== 'unset') {
			// just one stem is set, or all stems are equal
			if (stem_thinnest === stem_thickest) {
				// just one stem set and it's zero, or all stems are zero
				if (stem_thinnest === 0) {
					// extend the range to all weights count, so stems will display very thin
					// stem with zero width will be hidden from visualization
					stem_thickest = axis.weights.all.length;
				}
				// a single stem is set and it's not zero
				else if (stem_thinnest_i === stem_thickest_i) {
					// find its position in all weights list and find new thickest value (for Black weight)
					let percent = (stem_thinnest_i * 100) / (axis.weights.all.length - 1);
					if (stem_thinnest_i !== 0) {
						stem_thickest = (stem_thinnest * 100) / percent;
					} else {
						stem_thickest = stem_thickest * axis.weights.all.length;
					}
				}
				// all stems equal and it's not zero
				else {
					// similar to previous case but now with finding a medial value, so in this case all stems visually will look like stem of Medium weight
					stem_thickest = stem_thickest * 2;
				}
			}
			// thinnest and thickest stems are different (normal case)
			else {
				// check how much weights are hidden after last visible
				let first_visible = 'unset';
				let last_visible = 'unset';
				for (let key in axis.weights.router) {
					if (axis.weights.router[key] !== 'unset') {
						if (first_visible == 'unset') {
							first_visible = key;
						}
						last_visible = key;
					}
				}
				// extend thickest stem to amount of hidden weights before/after
				// normal scenario – thinnest stem at the beginning
				if (stem_thickest_i > stem_thinnest_i) {
					let hidden_after_last_visible = (axis.weights.all.length - 1) - last_visible;
					let last_visible_percent = (last_visible * 100) / (axis.weights.all.length - 1);
					stem_thickest = (stem_thickest * 100) / last_visible_percent;
				}
				// reverse scenario – thickest stem at the beginning
				else {
					let hidden_before_first_visible = (axis.weights.all.length - 1) - first_visible;
					let first_visible_percent = (first_visible * 100) / (axis.weights.all.length - 1);
					stem_thickest = ((stem_thickest * 100) / (100 - first_visible_percent));
				}
			}
			// applying visualization by comparing each value to the thickest stem value
			for (let i = 0; i < axis.weights.visible.length; i++) {
				let stem = axis.weights.visible[i].querySelector('.weight-stem');
				let stem_value = stem.value;
				let sidebearing = axis.weights.visible[i].querySelector('.weight-sidebearing');
				let sidebearing_value = sidebearing.value;
				let visualization_stem = axis.weights.visible[i].querySelector('.visualization-stem');
				let visualization_sidebearing = axis.weights.visible[i].querySelector('.visualization-sidebearing');
				// show and set stem visualization for current weight
				if (stem_value.length && stem_value !== '0' && Number(stem_value) > 0) {
					if (visualization_stem.classList.contains('visualization-hide')) {
						visualization_stem.classList.remove('visualization-hide');
					}
					let stem_width = (Number(stem_value) * 100) / stem_thickest;
					let sidebearing_width = ((Number(sidebearing_value) * 100) / stem_thickest) * 2;
					// prevent the rendered stem from being less than 4% (2px)
					if (stem_width < 4) {
						stem_width = 4;
					}
					if (sidebearing_width > 0) {
						sidebearing_width += stem_width;
					}
					visualization_stem.style.width = stem_width + '%';
					// show sidebearing visualization if sidebearing value is set and it's greater than zero
					if (sidebearing_value.length && sidebearing_value !== '0' && sidebearing_width > 0) {
						if (visualization_sidebearing.classList.contains('visualization-hide')) {
							visualization_sidebearing.classList.remove('visualization-hide');
						}
						visualization_sidebearing.style.width = sidebearing_width + '%';
					}
					// hide sidebearing visualization if sidebearing is not set or set to zero
					else {
						visualization_sidebearing.classList.add('visualization-hide');
					}
				}
				// hide both stem and sidebearing visualization for current weight if stem is not set or set to zero
				else {
					if (!visualization_stem.classList.contains('visualization-hide')) {
						visualization_stem.classList.add('visualization-hide');
					}
					if (!visualization_sidebearing.classList.contains('visualization-hide')) {
						visualization_sidebearing.classList.add('visualization-hide');
					}
				}
				// disable or enable stem and sidebearing input for instance without stem value
				if (stem_value) {
					stem.disabled = false;
				} else {
					if (!axis.weights.visible[i].classList.contains('master')) {
						stem.disabled = true;
					}
				}
				if (sidebearing_value) {
					sidebearing.disabled = false;
				} else {
					if (!axis.weights.visible[i].classList.contains('master')) {
						sidebearing.disabled = true;
					}
				}
			}
		}
		// hide all visualization if no stems are set at any weight
		else {
			for (let i = 0; i < axis.weights.visible.length; i++) {
				let visualization_stem = axis.weights.visible[i].querySelector('.visualization-stem');
				if (!visualization_stem.classList.contains('visualization-hide')) {
					visualization_stem.classList.add('visualization-hide');
				}
				let visualization_sidebearing = axis.weights.visible[i].querySelector('.visualization-sidebearing');
				if (!visualization_sidebearing.classList.contains('visualization-hide')) {
					visualization_sidebearing.classList.add('visualization-hide');
				}
			}
		}
		
		// hide or show stems and sidebearings
		for (let i = 0; i < axis.weights.all.length; i++) {
			if (!axis.weights.all[i].classList.contains('master')) {
				let stem = axis.weights.all[i].querySelector('.weight-stem');
				let stem_minus = axis.weights.all[i].querySelector('.weight-stem-minus');
				let stem_plus = axis.weights.all[i].querySelector('.weight-stem-plus');
				let sidebearing = axis.weights.all[i].querySelector('.weight-sidebearing');
				if (stem.value) {
					if (stem.parentElement.classList.contains('weight-stemsidebearing-hidden')) {
						stem.parentElement.classList.remove('weight-stemsidebearing-hidden');
					}
					if (stem_minus.classList.contains('weight-stem-minusplus-hide')) {
						stem_minus.classList.remove('weight-stem-minusplus-hide');
					}
					if (stem_plus.classList.contains('weight-stem-minusplus-hide')) {
						stem_plus.classList.remove('weight-stem-minusplus-hide');
					}
				} else {
					if (!stem.parentElement.classList.contains('weight-stemsidebearing-hidden')) {
						stem.parentElement.classList.add('weight-stemsidebearing-hidden');
					}
					if (!stem_minus.classList.contains('weight-stem-minusplus-hide')) {
						stem_minus.classList.add('weight-stem-minusplus-hide');
					}
					if (!stem_plus.classList.contains('weight-stem-minusplus-hide')) {
						stem_plus.classList.add('weight-stem-minusplus-hide');
					}
				}
				if (sidebearing.value) {
					if (sidebearing.parentElement.classList.contains('weight-stemsidebearing-hidden')) {
						sidebearing.parentElement.classList.remove('weight-stemsidebearing-hidden');
					}
				} else {
					if (!sidebearing.parentElement.classList.contains('weight-stemsidebearing-hidden')) {
						sidebearing.parentElement.classList.add('weight-stemsidebearing-hidden');
					}
				}
			}
		}
		
	// visualization end
	},



	progressions: {
		// for extreme masters interpolation
		// the steps could be equal or exponentally increasing
		
		formula: {
			equal: function(t, b, s, x) {
				return (b - t) / (s - 1) * (x - 1) + t;
			},
			impallari: function(t, b, s, x) {
				return (x - 1) / (s - 1) * axis.progressions.formula.equal(t, b, s, x) + (s - x) / (s - 1) * axis.progressions.formula.lucas(t, b, s, x);
			},
			schneider: function(t, b, s, x) {
				return (axis.progressions.formula.impallari(t, b, s, x) + axis.progressions.formula.lucas(t, b, s, x)) / 2;
			},
			lucas: function(t, b, s, x) {
				return t * Math.pow(b / t, (x - 1) / (s - 1));
			},
			abraham: function(t, b, s, x) {
				return (1 - Math.pow((x - 1) / (s - 1), 1.25)) * axis.progressions.formula.equal(t, b, s, x) + Math.pow((x - 1) / (s - 1), 1.25) * axis.progressions.formula.lucas(t, b, s, x);
			}
		},
		
		active: false,
		segments: document.querySelector('.progression-segments'),
		buttons: document.getElementsByClassName('progression'),
		
		apply: function(progression) {
			// progression toggles the extreme weights to masters and all intermediate weights to intances
			// check if extreme weights have stem value set
			let steps = axis.weights.visible.length;
			let percent;
			let position_first = Number(axis.weights.visible[0].querySelector('.weight-position').value);
			let position_last = Number(axis.weights.visible[axis.weights.visible.length - 1].querySelector('.weight-position').value);
			let position;
			let position_accurate;
			let stem_first = axis.weights.visible[0].querySelector('.weight-stem').value;
			let stem_last = axis.weights.visible[axis.weights.visible.length - 1].querySelector('.weight-stem').value;
			let stem = '';
			let sidebearing_first = axis.weights.visible[0].querySelector('.weight-sidebearing').value;
			let sidebearing_last = axis.weights.visible[axis.weights.visible.length - 1].querySelector('.weight-sidebearing').value;
			let sidebearing = '';
			if (stem_first.length && stem_last.length) {
				stem_first = Number(stem_first);
				stem_last = Number(stem_last);
				// if thinnest and thickest stems are not equal
				if (stem_first !== stem_last) {
					// more freedom for equal progression
					// restrict all the other progressions
					if (progression === 'equal' || (stem_first < stem_last && stem_first > 0 && stem_last > 0)) {
						stem = true;
					}
				}
			}
			// if extreme weights have no stem set
			if (stem === '') {
				axis.progressions.highlight();
				axis.interpolation();
				return;
			}
			if (sidebearing_first.length && sidebearing_last.length) {
				sidebearing_first = Number(sidebearing_first);
				sidebearing_last = Number(sidebearing_last);
				sidebearing = true;
			}
			// calculate and apply the values to the weight
			let apply_to_weight = function(i) {
				if (progression == 'equal') {
					stem = axis.progressions.formula.equal(stem_first, stem_last, steps, i + 1);
				} else if (progression == 'impallari') {
					stem = axis.progressions.formula.impallari(stem_first, stem_last, steps, i + 1);
				} else if (progression == 'schneider') {
					stem = axis.progressions.formula.schneider(stem_first, stem_last, steps, i + 1);
				} else if (progression == 'lucas') {
					stem = axis.progressions.formula.lucas(stem_first, stem_last, steps, i + 1);
				} else if (progression == 'abraham') {
					stem = axis.progressions.formula.abraham(stem_first, stem_last, steps, i + 1);
				}
				// find the percent and the weight position which is accurate but may contain decimals
				percent = ((stem - stem_first) * 100) / (stem_last - stem_first);
				position = position_first + (((position_last - position_first) * percent) / 100);
				// round position to integer and recalculate corrected stem value again
				position_accurate = position;
				position = Math.round(position);
				percent = ((position - position_first) * 100) / (position_last - position_first);
				stem = Math.round((stem_first + (((stem_last - stem_first) * percent) / 100)) * 100) / 100;
				if (axis.weights.rounded) {
					stem = Math.round(stem);
				}
				// calculate sidebearing if set
				if (sidebearing !== '') {
					sidebearing = Math.round((sidebearing_first + (((sidebearing_last - sidebearing_first) * percent) / 100)) * 100) / 100;
					if (axis.weights.rounded) {
						sidebearing = Math.round(sidebearing);
					}
				}
				// apply to weight
				axis.weights.visible[i].style.left = position_accurate / 10 + '%'
				axis.weights.visible[i].querySelector('.weight-position').value = position;
				axis.weights.visible[i].setAttribute('data-position-interpolated', position);
				axis.weights.visible[i].querySelector('.weight-stem').value = stem;
				axis.weights.visible[i].querySelector('.weight-sidebearing').value = sidebearing;
				// toggle adjusted weight to interpolated
				if (axis.weights.visible[i].classList.contains('adjusted')) {
					axis.weights.visible[i].classList.remove('adjusted');
				}
				// toggle master to instance
				else if (axis.weights.visible[i].classList.contains('master')) {
					axis.weights.visible[i].classList.remove('master');
					axis.weights.visible[i].classList.add('instance');
				}
			};
			// apply to each weight
			for (let i = 1; i < axis.weights.visible.length - 1; i++) {
				apply_to_weight(i);
			}
			// toggle extreme instances to masters
			// this is happens only for progressions, and not for Segments
			if (!axis.weights.visible[0].classList.contains('master')) {
				if (axis.weights.visible[0].classList.contains('adjusted')) {
					axis.weights.visible[0].classList.remove('adjusted');
				}
				axis.weights.visible[0].classList.remove('instance');
				axis.weights.visible[0].classList.add('master');
			}
			if (!axis.weights.visible[axis.weights.visible.length - 1].classList.contains('master')) {
				if (axis.weights.visible[axis.weights.visible.length - 1].classList.contains('adjusted')) {
					axis.weights.visible[axis.weights.visible.length - 1].classList.remove('adjusted');
				}
				axis.weights.visible[axis.weights.visible.length - 1].classList.remove('instance');
				axis.weights.visible[axis.weights.visible.length - 1].classList.add('master');
			}
			// update list of masters and extreme masters parameter
			axis.weights.masters = [];
			for (let i = 0; i < axis.weights.visible.length; i++) {
				if (axis.weights.visible[i].classList.contains('master')) {
					axis.weights.masters.push(i);
				}
			}
			axis.onlyextrememasters();
			// update visualization
			axis.visualization();
			axis.sets.highlight();
		},
		
		highlight: function(index) {
			// highlight the progression button if index is set, and unhighlight all the others
			for (let i = 0; i < axis.progressions.buttons.length; i++) {
				if (i === index) {
					axis.progressions.buttons[index].classList.add('progression-active');
				} else {
					if (axis.progressions.buttons[i].classList.contains('progression-active')) {
						axis.progressions.buttons[i].classList.remove('progression-active');
					}
				}
			}
			if (index + 1) {
				// save index of active progression
				axis.progressions.active = index + 1;
				if (axis.progressions.segments.classList.contains('progression-active')) {
					axis.progressions.segments.classList.remove('progression-active');
				}
			} else {
				// clear index of active progression
				axis.progressions.active = false;
				// highlight Segments button if at least one master is present
				if (axis.weights.masters.length) {
					if (!axis.progressions.segments.classList.contains('progression-active')) {
						axis.progressions.segments.classList.add('progression-active');
					}
				} else {
					if (axis.progressions.segments.classList.contains('progression-active')) {
						axis.progressions.segments.classList.remove('progression-active');
					}
				}
			}
		},
		
		equalchecker: function() {
			// highlight or unhighlight Segments or Equal button
			if (axis.weights.masters.length) {
				let stem_first = axis.weights.visible[0].querySelector('.weight-stem').value;
				let stem_last = axis.weights.visible[axis.weights.visible.length - 1].querySelector('.weight-stem').value;
				// activate Equal progression if only extreme weights are masters
				if (!axis.progressions.active && axis.weights.onlyextrememasters && stem_first.length && stem_last.length) {
					for (let i = 0; i < axis.progressions.buttons.length; i++) {
						if (axis.progressions.buttons[i].getAttribute('data') == 'equal') {
							axis.progressions.highlight(i);
						}
					}
				}
				// highlight Segments button if at least one weight is master
				else if (!axis.progressions.active && !axis.progressions.segments.classList.contains('progression-active')) {
					axis.progressions.segments.classList.add('progression-active');
				}
			}
			// all weights are instances
			else {
				axis.progressions.active = false;
				if (axis.progressions.segments.classList.contains('progression-active')) {
					axis.progressions.segments.classList.remove('progression-active');
				}
			}
		},
		
		readinesschecker: function(action, id) {
			// it happens when the cursor is over the progression button (hover)
			// check if stems are set for extreme weights, and if not – highlight them with a color
			// if stem for extreme weight is not set, also highlight the instance button (to set stem, it should be master, not instance)
			let check = function(index) {
				let index_opposite = 0;
				let weight = axis.weights.visible[index];
				let master = weight.querySelector('.weight-master');
				let stem = weight.querySelector('.weight-stem');
				let stem_opposite;
				let stem_negative = false;
				let stems_equal = false;
				let stems_degression = false;
				if (stem.value.length) {
					if (Number(stem.value) <= 0) {
						stem_negative = true;
					}
					if (index == 0) {
						index_opposite = axis.weights.visible.length - 1;
					}
					stem_opposite = axis.weights.visible[index_opposite].querySelector('.weight-stem');
					if (stem.value.length && stem_opposite.value.length) {
						if (Number(stem.value) === Number(stem_opposite.value)) {
							stems_equal = true;
						} else if (index < index_opposite && Number(stem.value) > Number(stem_opposite.value)) {
							stems_degression = true;
						} else if (index > index_opposite && Number(stem.value) < Number(stem_opposite.value)) {
							stems_degression = true;
						}
					}
				}
				if (!stem.value.length || (stem_negative && id !== 'equal') || (stems_degression && id !== 'equal') || stems_equal) {
					if (!stem.classList.contains('weight-stem-warning')) {
						stem.classList.add('weight-stem-warning');
						stem.parentElement.classList.add('weight-stemlabel-warning');
						if (!weight.classList.contains('master') && !master.classList.contains('weight-master-warning')) {
							master.classList.add('weight-master-warning');
						}
					}
				}
			};
			let clear = function(index) {
				let master = axis.weights.visible[index].querySelector('.weight-master');
				let stem = axis.weights.visible[index].querySelector('.weight-stem');
				if (master.classList.contains('weight-master-warning')) {
					master.classList.remove('weight-master-warning');
				}
				if (stem.classList.contains('weight-stem-warning')) {
					stem.classList.remove('weight-stem-warning');
					stem.parentElement.classList.remove('weight-stemlabel-warning');
				}
			};
			if (action == 'check') {
				check(0);
				check(axis.weights.visible.length - 1);
			} else if (action == 'clear') {
				clear(0);
				clear(axis.weights.visible.length - 1);
			}
		},
		
		setup: function() {
			// turn off any active progression
			axis.progressions.segments.addEventListener('click', function() {
				axis.progressions.highlight();
				axis.progressions.equalchecker();
				if (axis.progressions.active && axis.weights.onlyextrememasters) {
					axis.progressions.apply('equal');
				} else {
					axis.interpolation();
				}
			});
			for (let i = 0; i < axis.progressions.buttons.length; i++) {
				// click on a progression name
				let progression_id = axis.progressions.buttons[i].getAttribute('data');
				axis.progressions.buttons[i].addEventListener('click', function() {
					if (!axis.progressions.buttons[i].classList.contains('progression-active')) {
						axis.progressions.readinesschecker('clear');
					}
					axis.progressions.highlight(i);
					axis.progressions.apply(progression_id);
				});
				// check if the weights are ready for progression calculation – stems should be set for the extreme weights (even if interpolated)
				if (!('ontouchstart' in document.documentElement)) {
					axis.progressions.buttons[i].addEventListener('mouseenter', function() {
						axis.progressions.readinesschecker('check', progression_id);
					});
					axis.progressions.buttons[i].addEventListener('mouseleave', function() {
						axis.progressions.readinesschecker('clear');
					});
				}
			}
			// activate equal progression if only extreme weights are masters by default
			axis.progressions.equalchecker();
			// highlight the segments button if axis.weights.defaults doesn't have two extreme visible masters set, with stems values specified
			if (!axis.progressions.active) {
				if (!axis.progressions.segments.classList.contains('progression-active')) {
					axis.progressions.segments.classList.add('progression-active');
				}
			}
		}
		
	// progressions end
	},



	sets: {
		// saving set you save an imprints of axis state
		// count of sets is limited by count of its labels
		
		labels: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'],
		
		elements: {
			list: document.querySelector('.sets-list'),
			save: document.querySelector('.sets-save')
		},
		list: [],
		
		gatherset: function() {
			// gather all the data from every weight
			let set = {
				weights: [],
				progression: false
			};
			for (let i = 0; i < axis.weights.all.length; i++) {
				let weight_element = axis.weights.all[i];
				let weight_position = weight_element.querySelector('.weight-position');
				let weight_stem = weight_element.querySelector('.weight-stem');
				let weight_sidebearing = weight_element.querySelector('.weight-sidebearing');
				// gather weight data
				let weight = {
					master: (weight_element.classList.contains('master')) ? true : false,
					instance: (weight_element.classList.contains('instance')) ? true : false,
					adjusted: (weight_element.classList.contains('adjusted')) ? true : false,
					hidden: (weight_element.classList.contains('hidden')) ? true : false,
					position_interpolated: false,
					stem_extreme: false,
					sidebearing_extreme: false,
					percent: Number(weight_element.style.left.replace('%', '')),
					position: weight_position.value,
					stem: weight_stem.value,
					stem_disabled: weight_stem.disabled,
					sidebearing: weight_sidebearing.value,
					sidebearing_disabled: weight_sidebearing.disabled
				}
				if (weight_element.hasAttribute('data-position-interpolated')) {
					weight.position_interpolated = weight_element.getAttribute('data-position-interpolated');
				}
				if (weight_element.hasAttribute('data-stem-extreme')) {
					weight.stem_extreme = weight_element.getAttribute('data-stem-extreme');
				}
				if (weight_element.hasAttribute('data-sidebearing-extreme')) {
					weight.sidebearing_extreme = weight_element.getAttribute('data-sidebearing-extreme');
				}
				// add weight data to set data
				set.weights.push(weight);
			}
			// also remember what the progression is highlighted
			for (let p = 0; p < axis.progressions.buttons.length; p++) {
				if (axis.progressions.buttons[p].classList.contains('progression-active')) {
					set.progression = p + 1;
					break;
				}
			}
			if (axis.weights.rounded) {
				set.rounded = true;
			} else {
				set.rounded = false;
			}
			return set;
		},
		
		saveset: function() {
			// gather set and add it to sets list
			axis.sets.list.push(axis.sets.gatherset());
			// update the index of the last used set label
			axis.sets.labelused++;
			if (axis.sets.labelused === axis.sets.labels.length) {
				axis.sets.labelused = 0;
			}
			// find first available set label
			let set_label;
			let set_buttons_labels = document.getElementsByClassName('set-label');
			for (let i = 0; i < axis.sets.labels.length; i++) {
				let found = false;
				for (let j = 0; j < set_buttons_labels.length; j++) {
					if (axis.sets.labels[i] == set_buttons_labels[j].textContent) {
						found = true;
						break;
					}
				}
				if (!found) {
					set_label = axis.sets.labels[i];
					break;
				}
			}
			// add set button
			let set_button = document.createElement('div');
			let set_restore = document.createElement('div');
			let set_restore_label = document.createElement('span');
			let set_restore_label_ending = document.createTextNode(' set');
			let set_remove = document.createElement('div');
			let set_remove_label = document.createElement('div');
			set_button.classList.add('set');
			set_button.classList.add('set-active');
			set_restore.classList.add('set-name');
			set_restore_label.classList.add('set-label');
			set_remove.classList.add('set-remove');
			set_remove_label.classList.add('set-remove-label');
			set_restore_label.textContent = set_label;
			set_remove_label.textContent = 'Remove';
			set_restore.addEventListener('click', function() {
				if (!set_button.classList.contains('set-active')) {
					let index = [].indexOf.call(set_button.parentNode.children, set_button);
					axis.sets.restoreset(index);
				}
			});
			set_remove.addEventListener('click', function() {
				let index = [].indexOf.call(set_button.parentNode.children, set_button);
				axis.sets.removeset(set_button, index);
			});
			set_restore.appendChild(set_restore_label);
			set_restore.appendChild(set_restore_label_ending);
			set_remove.appendChild(set_remove_label);
			set_button.appendChild(set_restore);
			set_button.appendChild(set_remove);
			axis.sets.highlight();
			axis.sets.elements.list.appendChild(set_button);
			// hide save button if saved sets count is equal of sets labels count
			if (axis.sets.list.length === axis.sets.labels.length) {
				axis.sets.elements.save.classList.add('sets-save-hidden');
			}
		},
		
		restoreset: function(index) {
			// highlight or unhighlight rounded button
			let rounded = document.querySelector('.rounded');
			if ((axis.sets.list[index].rounded && !axis.weights.rounded) || (!axis.sets.list[index].rounded && axis.weights.rounded)) {
				rounded.click();
			}
			// restore every value of every weight from set
			for (let i = 0; i < axis.sets.list[index].weights.length; i++) {
				let data = axis.sets.list[index].weights[i];
				let weight = axis.weights.all[i];
				let weight_position = weight.querySelector('.weight-position');
				let weight_stem = weight.querySelector('.weight-stem');
				let weight_sidebearing = weight.querySelector('.weight-sidebearing');
				if (data.master) {
					if (!weight.classList.contains('master')) {
						weight.classList.add('master');
					}
				} else {
					if (weight.classList.contains('master')) {
						weight.classList.remove('master');
					}
				}
				if (data.instance) {
					if (!weight.classList.contains('instance')) {
						weight.classList.add('instance');
					}
				} else {
					if (weight.classList.contains('instance')) {
						weight.classList.remove('instance');
					}
				}
				if (data.adjusted) {
					if (!weight.classList.contains('adjusted')) {
						weight.classList.add('adjusted');
					}
				} else {
					if (weight.classList.contains('adjusted')) {
						weight.classList.remove('adjusted');
					}
				}
				if (data.hidden) {
					if (!weight.classList.contains('hidden')) {
						weight.classList.add('hidden');
					}
				} else {
					if (weight.classList.contains('hidden')) {
						weight.classList.remove('hidden');
					}
				}
				if (data.position_interpolated) {
					weight.setAttribute('data-position-interpolated', data.position_interpolated);
				} else {
					if (weight.hasAttribute('data-position-interpolated')) {
						weight.removeAttribute('data-position-interpolated');
					}
				}
				if (data.stem_extreme) {
					weight.setAttribute('data-stem-extreme', data.stem_extreme);
				} else {
					if (weight.hasAttribute('data-stem-extreme')) {
						weight.removeAttribute('data-stem-extreme');
					}
				}
				if (data.sidebearing_extreme) {
					weight.setAttribute('data-sidebearing-extreme', data.sidebearing_extreme);
				} else {
					if (weight.hasAttribute('data-sidebearing-extreme')) {
						weight.removeAttribute('data-sidebearing-extreme');
					}
				}
				let stem_value = data.stem;
				let sidebearing_value = data.sidebearing;
				if (axis.weights.rounded) {
					if (stem_value.length) {
						stem_value = Math.round(stem_value);
					}
					if (sidebearing_value.length) {
						sidebearing_value = Math.round(sidebearing_value);
					}
				}
				weight.style.left = data.percent + '%';
				weight_position.value = data.position;
				weight_stem.value = stem_value;
				weight_sidebearing.value = sidebearing_value;
				if (data.stem_disabled) {
					weight_stem.disabled = true;
					weight_stem.parentElement.classList.add('weight-stemsidebearing-hidden');
				} else {
					weight_stem.disabled = false;
					weight_stem.parentElement.classList.remove('weight-stemsidebearing-hidden');
				}
				if (data.sidebearing_disabled) {
					weight_sidebearing.disabled = true;
					weight_sidebearing.parentElement.classList.add('weight-stemsidebearing-hidden');
				} else {
					weight_sidebearing.disabled = false;
					weight_sidebearing.parentElement.classList.remove('weight-stemsidebearing-hidden');
				}
			}
			// highlight the progression button
			if (axis.sets.list[index].progression) {
				axis.progressions.highlight(axis.sets.list[index].progression - 1);
			} else {
				axis.progressions.highlight();
			}
			axis.sets.highlight(index);
			// update general params and visualization
			// the delay is required to let the browser to update all the fields required on visualization step
			setTimeout(function() {
				axis.routing();
				axis.onlyextrememasters();
				axis.visualization();
			}, 0);
		},
		
		removeset: function(button, index) {
			// remove a set from list array
			axis.sets.list.splice(index, 1);
			// remove a button
			button.remove();
			// show save button if saved sets count is lower of sets labels count
			if (axis.sets.list.length < axis.sets.labels.length) {
				axis.sets.elements.save.classList.remove('sets-save-hidden');
			}
		},
		
		highlight: function(index) {
			// highlight the set button if index is set, and unhighlight all the other sets buttons
			let set_buttons = document.getElementsByClassName('set');
			for (let i = 0; i < set_buttons.length; i++) {
				if (i === index) {
					set_buttons[i].classList.add('set-active');
				} else {
					if (set_buttons[i].classList.contains('set-active')) {
						set_buttons[i].classList.remove('set-active');
					}
				}
			}
		},
		
		setup: function() {
			axis.sets.elements.save.addEventListener('click', function() {
				if (axis.sets.list.length < axis.sets.labels.length) {
					axis.sets.saveset();
				}
			});
		}
		
	// sets end
	}



};
axis.setup();
