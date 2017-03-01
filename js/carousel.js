;(function($) {

	var Carousel = function(poster) {

		var that = this;
		this.poster = poster;

		this.posterItemMain = poster.find("ul.poster-list");
		this.PrevBtn = poster.find("div.poster-prev-btn");
		this.NextBtn = poster.find("div.poster-next-btn");
		this.posterItems = this.poster.find("li.poster-item");
		this.posterFirstItem = this.posterItems.eq(0);
		this.posterLastItem = this.posterItems.last();

		// 默认配置参数
		this.setting = {
				width: 1000,
				height: 270,
				posterWidth: 600,
				posterHeight: 270,
				scale: 0.9,
				speed: 500,
				autoPlay: true,
				delay: 1000,
				verticalAlign: "middle",
		}

		$.extend(this.setting, this.getSetting());
		
		this.setSettingValue();
		this.setPosterPos();

		// 点击旋转
		this.flag = true;
		this.NextBtn.click(function() {
			if (that.flag) {
				that.flag = false;
				that.carouselPic("left");
			}
		});
		this.PrevBtn.click(function() {
			if (that.flag) {
				that.flag = false;
				that.carouselPic("right");
			}		
		});

		// 是否自动播放
		if (this.setting.autoPlay) {
			this.autoPlay()
			this.poster.hover(function() {
				clearInterval(that.timer);
			}, function() {
				that.autoPlay();
			})
		};

	};

	Carousel.prototype = {

		// 获取人工配置参数
		getSetting: function() {
			var setting = this.poster.attr("data-setting");
			if (setting && setting != "") {
				return $.parseJSON(setting);
			}
			else {
				return {};
			}
		},

		// 设置配置参数控制宽度、高度
		setSettingValue: function() {
			this.poster.css({
				width: this.setting.width,
				height: this.setting.height,
			});
			this.posterItemMain.css({
				width: this.setting.width,
				height: this.setting.height,
			});
			// 左右切换按钮的宽高
			var w = (this.setting.width - this.setting.posterWidth)/2;
			this.PrevBtn.css({
				width: w,
				height: this.setting.height,
				zIndex: Math.ceil(this.posterItems.length/2),
			});
			this.NextBtn.css({
				width: w,
				height: this.setting.height,
				zIndex: Math.ceil(this.posterItems.length/2),
			});
			// 第一帧图片宽、高
			this.posterFirstItem.css({
				width: this.setting.posterWidth,
				height: this.setting.posterHeight,
				left: w,
				zIndex: Math.floor(this.posterItems.length/2),
			});

		},

		// 剩余的帧的位置关系
		setPosterPos: function() {
			var that = this;

			var sliceItems = this.posterItems.slice(1);
			var sliceLength = sliceItems.length/2;
			var rightSlice = sliceItems.slice(0, sliceLength);
			var leftSlice = sliceItems.slice(rightSlice.length);
			var leve = Math.floor(this.posterItems.length/2);

			var rw = this.setting.posterWidth;
			var rh = this.setting.posterHeight;
			var gap = ((this.setting.width - rw)/2)/leve; // 每帧图片之间的间隙

			var firstLeft = (this.setting.width - rw)/2;
			var fixOffsetLeft = firstLeft + rw;


			rightSlice.each(function(i) {
				var j = i;
				leve--;
			    rw *= that.setting.scale;
			    rh *= that.setting.scale;
				$(this).css({
					zIndex: leve,
					width: rw,
					height: rh,
					opacity: 1/(++j),
					left: fixOffsetLeft+(++i)*gap - rw,
					top: that.setVertucalAlign(rh),
				});
			});

			var lw = rightSlice.last().width();
			var lh = rightSlice.last().height();
			var oloop = Math.floor(this.posterItems.length/2);
			leftSlice.each(function(i) {

				$(this).css({
					zIndex: i,
					width: lw,
					height: lh,
					opacity: 1/oloop,
					left: i*gap,
					top: that.setVertucalAlign(lh),
				});

				lw = lw/that.setting.scale;
				lh = lh/that.setting.scale;
				oloop--;
			});
		},	

		// 垂直排列的对齐关系
		setVertucalAlign: function(height) {
			var verticalType = this.setting.verticalAlign;
			var top = 0;

			if (verticalType === "middle") {
				top = (this.setting.height - height)/2;
				console.log(this.setting.height)
			}
			else if (verticalType === "top") {
				top = 0;
			}
			else if (verticalType === "bottom") {
				top = this.setting.height - height;
			}
			else {
				top = (this.setting.height - height)/2;
			}
			return top; 
		},

		// 点击旋转
		carouselPic: function(dir) {
			var that = this;
			var posterItemsZindex = [];

			if (dir === "left") {
				this.posterItems.each(function() {
					var _this = $(this);
					var prev = _this.prev().get(0) ? _this.prev() : that.posterLastItem;
					var width = prev.width(),
						height = prev.height(),
						zIndex = prev.css("zIndex"),
						opacity = prev.css("opacity"),
						left = prev.css("left"),
						top = prev.css("top");
					posterItemsZindex.push(zIndex);

					_this.animate({
						width: width,
						height: height,
						opacity: opacity,
						left: left,
						top: top,
					}, that.setting.speed, function(){
						that.flag = true;
					});

				});
				this.posterItems.each(function(i) {
					$(this).css("zIndex", posterItemsZindex[i])
				});
			}
			else if (dir === "right") {
				this.posterItems.each(function() {

					var _this = $(this);
					var next = _this.next().get(0) ? _this.next() : that.posterFirstItem;
					var width = next.width(),
						height = next.height(),
						zIndex = next.css("zIndex"),
						opacity = next.css("opacity"),
						left = next.css("left"),
						top = next.css("top");
					posterItemsZindex.push(zIndex);

					_this.animate({
						width: width,
						height: height,
						opacity: opacity,
						left: left,
						top: top,
					}, that.setting.speed, function() {
						that.flag = true;
					});
				});
				this.posterItems.each(function(i) {
					$(this).css("zIndex", posterItemsZindex[i])
				});
			}	
		},

		// 是否自动播放
		autoPlay: function() {
			var that = this;
			this.timer = window.setInterval(function() {
				that.NextBtn.click();
			}, this.setting.delay);
		},

	};

	Carousel.init = function(posters){
		var _this = this;
		posters.each(function(){
			new  _this($(this));
		});
	};

	window["Carousel"] = Carousel;


})(jQuery);