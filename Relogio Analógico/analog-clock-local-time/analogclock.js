$.fn.analogclock = async function(_options) {
	this.html('<div class="analogclock-h-hand"></div><div class="analogclock-m-hand"></div>');//
	this.addClass("analogclock-clock");

	let option = {
		x: 0,
		y: 0,
		size: 500,
		skew: 0,
		rotate: 0,
		scale: [1,1],
		hour_transform_origin:'95.89%',
		min_transform_origin:'96.72%',
	};
	
	if (_options != undefined) {
		jQuery.each(_options, function(i, val) {
			option[i] = val;
		});
	}
	
	let hour_img_width = 0, hour_img_height = 0, min_img_width = 0, min_img_height = 0;

	const img1 = new Image();
	img1.onload = function() {
		hour_img_width = this.width;
		hour_img_height = this.height;
	}
	img1.src = 'img/hour.svg';

	const img2 = new Image();
	img2.onload = function() {
		min_img_width = this.width;
		min_img_height = this.height;
	}
	img2.src = 'img/min.svg';

	console.log("waiting for image size");
	while(hour_img_width == 0 || hour_img_height == 0 || min_img_width == 0 || min_img_height == 0)
		await new Promise(resolve => setTimeout(resolve, 10));
	console.log("image size is defined", hour_img_width);

	let init = function(clock) {
		let clock_width = option.size;
		let clock_height = option.size;

		let hourheight = clock_height * 25 / 100;
		let hourwidth = hour_img_width * (hourheight / hour_img_height);
		let minheight = clock_height * 35 / 100;
		let minwidth = min_img_width * (minheight / min_img_height);

		let hourleft = (clock_width - hourwidth) / 2;
		let hourtop = clock_height/2 - hourheight + ((100 - parseFloat(option.hour_transform_origin)) * hourheight / hour_img_height);

		let minleft = clock_width/2 - minwidth / 2;
		let mintop = clock_height/2 - minheight + ((100 - parseFloat(option.min_transform_origin)) * minheight / min_img_height);

		clock.css("left",(option.x-clock_width/2) + "px");
		clock.css("top", (option.y-clock_height/2) + "px");
		clock.css("width", clock_width + "px");
		clock.css("height", clock_height + "px");

		clock.find('.analogclock-h-hand').css("left", hourleft + "px");
		clock.find('.analogclock-h-hand').css("top", hourtop + "px");
		clock.find('.analogclock-m-hand').css("left", minleft + "px");
		clock.find('.analogclock-m-hand').css("top", mintop + "px");

		clock.find('.analogclock-h-hand').css("width", hourwidth + "px");
		clock.find('.analogclock-h-hand').css("height", hourheight + "px");

		clock.find('.analogclock-m-hand').css("width", minwidth + "px");
		clock.find('.analogclock-m-hand').css("height", minheight + "px");

		clock.find('.analogclock-h-hand').css("transform-origin", "50% " + option.hour_transform_origin);
		clock.find('.analogclock-m-hand').css("transform-origin", "50% " + option.min_transform_origin);

		let transform = "";
		transform += " scale(" + option.scale[0] + ", " + option.scale[1] + ")";
		transform += " skew(" + option.skew + "deg)";
		transform += " rotate(" + option.rotate + "deg)";
		clock.css("transform", transform);
	}

	let clock = function(clock) {
		let date= new Date();
		let time=[date.getHours(), date.getMinutes(), date.getSeconds()];
		let clockDivs=[clock.find('.analogclock-h-hand'), clock.find('.analogclock-m-hand')];

		let hour=time[0]*30 + time[1]/2;

		clockDivs[0].css("transform", "rotate("+hour +"deg)");
		clockDivs[1].css("transform", "rotate("+ (time[1]*6) +"deg)");
	}
	
	init(this);
	clock(this);
	setInterval(clock, 1000, this);
};

