//
var howlPlayer = function(options){///howlPlayer
    var options = options || {};
    //var audio =  document.querySelectorAll('[data-audio-key="' + 80 + '"]')[0].src;
    this.sample = options.sample || "Audio/guitar/gtr_aco_steel.mp3";
if(dbg<=2)console.log('audio file',this.sample);
    this.sampleLength = options.sampleLength || 2000;
    return this.init();
};
howlPlayer.prototype = {
    init: function(){ return new Howl({urls: [this.sample], sprite: this.getOffsets()});},
    getOffsets: function(){
        //var keys          = ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
        var keys          = ['0','1','2','3','4','5','6','7','8','9','10','11'];
        var offset        = 0;
        var sprite        = {};
        var octaves       = 5;
				var cut	=1200;
        for (var n = 0; n < octaves; n++){
            var octave = n+1;
            for(var key in keys){
							sprite[keys[key] +'/'+octave] = [offset, cut];//this.sampleLength
							offset += this.sampleLength;
						}
        }
if(dbg<=2)console.log('player.sprites=',sprite);
        return sprite;
    },
		onFade: function(){},
		onVolume: function(){ if (this.volume == 0.6) alert("Volume is currently 0.6!");}
};
