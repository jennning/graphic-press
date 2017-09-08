// requestAnimationFrame polyfill
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
// end polyfill

function initMap() {
	var el = $('#map-container')[0],
		pos = {lat: 3.07493, lng: 101.634136},
		opt = {
			center: pos,
			zoom: 18,
			scrollwheel: false
		};

	var map = new google.maps.Map(el, opt);

	var marker_icon = 'data:image/svg+xml;utf-8,<svg version="1.1" id="map_marker" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="64px" height="64px" viewBox="0 0 33.468 33.468" style="enable-background:new 0 0 33.468 33.468; fill: #ed1b24;" xml:space="preserve"><path d="M16.734,0C9.375,0,3.408,5.966,3.408,13.325c0,11.076,13.326,20.143,13.326,20.143S30.06,23.734,30.06,13.324 C30.06,5.965,24.093,0,16.734,0z M16.734,19.676c-3.51,0-6.354-2.844-6.354-6.352c0-3.508,2.844-6.352,6.354-6.352 c3.508-0.001,6.352,2.845,6.352,6.353C23.085,16.833,20.242,19.676,16.734,19.676z"/></svg>',
		marker = new google.maps.Marker({
			position: pos,
			map: map,
			icon: marker_icon
		});

	marker.addListener('click', function() {
		map.panTo(marker.getPosition());
	});
}

function cssTransform($el, transform_css) {
	$el.css({
		'webkit-transform': transform_css,
		'transform': transform_css
	})
}

var $w = $(window),
	page = ['home', 'login'];

function initPage() {
	var temp_page = [],
		p;

	while(page.length) {
		p = [page[0]];

		temp_page[p] = $('#' + p).length;

		page.shift();
	}

	page = temp_page;
}

initPage();

var $header = $('#header'),
	$header_container = $header.children(0).eq(0),
	$html_body = $('html, body'),
	min_scroll_speed = 300,
	max_scroll_speed = 3000,
	max_scroll_dist = $html_body.height(),
	$nav_toggle = $('#nav_toggle'),
	$lang_selector = $('#lang_selector');

$(function() {
	if(page.home) {
		initMap();

		$('#journey').owlCarousel({
			autoplay: true,
			autoplaySpeed: 3000,
			mouseDrag: false,
			touchDrag: false,
			dots: true,
			dotsSpeed: 1500,
			dotsEach: 1,
			nav: true,
			navText: ['', ''],
			navSpeed: 1500,
	        responsive: {
	            0: {
	                items: 1
	            },
	            500: {
	                items: 2
	            },
	            769: {
	                items: 3
	            }
	        }
		});

		$nav_toggle.click(function(e) {
	        e.preventDefault();

	        var $container = $(this).parent(),
	            show_c = 'show-nav',
	            hide_c = 'hide-nav',
	            close_anim_duration = 500;

	        if($container.hasClass(show_c)) {
	            if($container.hasClass(hide_c)) {
	                return;
	            }

	            $container.addClass(hide_c);

	            setTimeout(function() {
	                $container.removeClass(show_c + ' ' + hide_c);
	            }, close_anim_duration);
	        } else {
	            $container.addClass(show_c);
	        }
	    });

		$('a').click(function(e) {
			var $a = $(this);

			if($a.attr('href').charAt(0) === '#') {
				e.preventDefault();

				var $target_point = $($a.attr('href')),
					target_pos = $target_point.position().top - $header.innerHeight() + parseInt($target_point.css('padding-top')) - 80,
					scroll_speed = Math.abs($w[0].scrollY - target_pos) / max_scroll_dist * max_scroll_speed;

				scroll_speed = scroll_speed < min_scroll_speed? min_scroll_speed : scroll_speed;

				if(parseInt(target_pos) !== $w[0].scrollY) {
					$html_body.animate({
						'scrollTop': target_pos
					}, scroll_speed, function() {
						$a.blur();
						if($header_container.hasClass('show-nav')) {
							$nav_toggle.click();
						}
					});
				}
			}
		});
	}

	$('#current_year').html(new Date().getFullYear());

	$lang_selector.click(function(e) {
		e.preventDefault();

		var $container = $(this).parent(),
			show_c = 'show';

		if($container.hasClass(show_c)) {
			$container.removeClass(show_c);
			$(document).off('click');
		} else {
			$container.addClass(show_c);
			e.stopPropagation();

			$(document).on('click', function(e) {
				if(!$container[0].contains(e.target)) {
					$lang_selector.click();
				}
			});
		}
	});
});

$w.resize(function() {
	if($w.width() > 768) {
		$header_container.removeClass('show-nav');
	}
});

if(page.home) {
		// logo
	var $sec_1_text = $('#sec_1_text'),
		logo_trigger = $sec_1_text.offset().top + $sec_1_text.height() - $header.height(),
		$header_logo = $('#header_logo'),

		// equipment scroll
		$start = $('#products_services'),
		$end = $('#our_equipments'),
		z_start_p = $start.position().top,
		z_end_p = $end.position().top + $end.innerHeight(),
		z_dist = z_end_p - z_start_p,
		$z = $('#equipment_background'),
		max_zoom_v = parseFloat('1.1'),
		zoom_v,
		calcZoom = function(p) {
			return (p - z_start_p) / z_dist * (max_zoom_v - 1) + 1;
		},
		setZoom = function(z) {
			var v = z? 'scale('+ z +')' : '';

			requestAnimationFrame(function() {
				cssTransform($z, v);
			});
		};

	$w.scroll(function() {
		var w_pos = this.scrollY,
			w_end = w_pos + this.innerHeight,
			w_mid = w_pos + this.innerHeight / 2;

		if(w_mid > z_start_p && w_mid < z_end_p) {
			zoom_v = calcZoom(w_mid);

			setZoom(zoom_v);
		} else if (w_mid >= z_end_p) {
			setZoom(max_zoom_v);
		} else {
			setZoom();
		}

		if(w_pos > logo_trigger) {
			$header_logo.addClass('show');
		}  else if(!$header_logo.hasClass('hide') && $header_logo.hasClass('show')) {
			$header_logo.addClass('hide');

			setTimeout(function() {
				$header_logo.removeClass('show hide');
			}, 300);
		}
	});

	var company_value_arr = [
			'In effectiveness we serve.',
			'In efficiency we deliver.',
			'In excellence we achieve.'
		],
		swapTimer = 3000,
		$company_value = $('#company_value'),
		$company_value_text = $('#company_value_text');

	function swapCompanyValue(id) {
		var id = id || 1,
			current_id = id % 3,
			current_value = company_value_arr[current_id];

		$company_value.addClass('paint-now');

		current_id++;

		setTimeout(function() {
			$company_value_text.html(current_value);
			setTimeout(function() {
				$company_value.removeClass('paint-now');
				setTimeout(function() {
					swapCompanyValue(current_id);
				}, swapTimer);
			}, 300);
		}, 300);
	}

	function initLanding() {
		setTimeout(function() {
			requestAnimationFrame(function() {
				$sec_1_text.addClass('init-animation');
			});

			setTimeout(function() {
				$sec_1_text.addClass('done-animation').removeClass('init-animation');
				setTimeout(function() {
					swapCompanyValue();
				}, swapTimer);
			}, 3200);
		}, 300);
	}

	$(document).ready(function() {
		var callInitLanding = function(d) {
			var f = d && d.hasFocus()? true : false;

			if(!f) {
				setTimeout(function() {
					callInitLanding(d);
				}, 100);

				return;
			}

			initLanding();
		}

		callInitLanding(this);
	});

	var $sec_7 = $('#people_serve'),
		$sec_7_background = $('#sec_7_background'),
		reset_c = 'resetting',
		move_background = false,
		moveable_space = 30,
		hover_f = 0,
		mouse = {
			x: 0,
			y: 0
		};

	$sec_7.hover(initBackground, resetBackground);

	function initBackground() {
		move_background = true;

		if($sec_7_background.hasClass(reset_c)) {
			setTimeout(function() {
				initBackground();
			}, 200);
			return;
		}

		$(document).on('mousemove',function(e) {
			mouse.x = e.clientX;
			mouse.y = e.clientY;
		});

		requestAnimationFrame(animateBackground);
	}

	function resetBackground() {
		move_background = false;
		hover_f = 0;

		$(document).unbind('mousemove');

		$sec_7_background.addClass(reset_c);

		cssTransform($sec_7_background, '');

		setTimeout(function() {
			$sec_7_background.removeClass(reset_c);
		}, 300);
	}

	function animateBackground() {
		if(!move_background) {
			return;
		}

		hover_f += hover_f <= 1? 0.125 : 0;

		var calcPos = function(mouse_pos, el_dimension) {
				return (0.5 - mouse_pos / el_dimension) / 0.5 * moveable_space * hover_f;
			},
			trans_x = calcPos(mouse.x, $w.width()),
			trans_y = calcPos(mouse.y, $w.height());

		var translate_css = 'translate('+ trans_x +'px, '+ trans_y +'px)';

		cssTransform($sec_7_background, translate_css);

		requestAnimationFrame(animateBackground);
	}
}

if(page.login) {
	initFormControl();
}

function initFormControl() {
	var $form_control = $('.form-control'),
		$form_label = false,
		$form_block = false,
		focus_c = 'focused',

		animateLabel = function($target, d_1, d_2) {
			var d = {},
				get_translate = function(start, end) {
					return start - end;
				},
				get_scale = function(start, end) {
					return start / end;
				};

			for(var k in d_1) {
				if(k == 'top' || k == 'left') {
					d[k] = get_translate(d_1[k], d_2[k]);
				}

				if(k == 'width' || k == 'height') {
					d[k] = get_scale(d_1[k], d_2[k]);
				}
			}

			$target.css('transform', 'translateX('+ d.left +'px) translateY('+ d.top +'px) scaleX('+ d.width +') scaleY('+ d.height +')');

			requestAnimationFrame(function() {
				$target.css({
					'transition': 'transform .2s ease',
					'transform': ''
				});
			});

			setTimeout(function() {
				$target.css('transition', '');
			}, 200);
		};

	$form_control.focus(function(e) {
		var $control = $(this);

		$form_label = $control.next();
		$form_block = $control.parent();

		var label = $form_label[0],
			label_d_1 = label.getBoundingClientRect();

		$form_block.addClass(focus_c);

		var label_d_2 = label.getBoundingClientRect();

		animateLabel($form_label, label_d_1, label_d_2);

	}).blur(function() {
		if(!$form_label || !$form_block) {
			return;
		}

		var $control = $(this),
			v = $control.val();

		if(v == '') {
			var label = $form_label[0],
				label_d_1 = label.getBoundingClientRect();

			$form_block.removeClass(focus_c);

			var label_d_2 = label.getBoundingClientRect();

			animateLabel($form_label, label_d_1, label_d_2);
		}

		$form_label = false;
		$form_block = false;
	});


}
