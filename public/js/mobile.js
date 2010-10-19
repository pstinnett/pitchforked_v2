Ext.ns('pitchforked');

var soundManagerHtml = '<div id="control-template"><div class="controls"><div class="statusbar"><div class="loading"></div><div class="position"></div></div></div><div class="timing"><div id="sm2_timing" class="timing-data"><span class="sm2_position">%s1</span> / <span class="sm2_total">%s2</span></div></div><div class="peak"><div class="peak-box"><span class="l"></span><span class="r"></span></div></div></div><div id="spectrum-container" class="spectrum-container"><div class="spectrum-box"><div class="spectrum"></div></div></div><ul class="playlist"><li><a href="http://8tracks.s3.amazonaws.com/tf/001/046/252/59799.mp3">Crash cymbal</a></li><li><a href="http://8tracks.s3.amazonaws.com/tf/001/046/252/59799.mp3">Crash cymbal</a></li></ul><div id="sm2-container"></div>';

pitchforked.Main = {
	demo : function() {
		//this handles the taps. may need to be expanded.
		var tapHandler = function (btn, evt) {
			if( activeCard == 0 )
			{
		    	pitchforked.setCard(1);
				activeCard = 1;
			}
			else
			{
				pitchforked.setCard(0);
				activeCard = 0;
			}
		}
		
		var playPause = function (btn, evt) {
			alert('this will toggle play/pause');
		}
		
		var nextTrack = function (btn, evt) {
			alert('this will jump to the next track (or start playing if no track is playing)');
		}
		
		// These are the icons that get dropped into bars
		var topItems = [
			{ xtype: 'spacer' },
			{ iconMask: true, iconCls: 'refresh' }	
		]
		var bottomItems = [
			{ xtype: 'spacer' },
			{ iconMask: true, iconCls: 'arrow_right', iconAlign: 'center' },
			{ xtype: 'spacer' },
		]
		
		//These are the title bar and bottom bar with icons
		var dockeditems = [
			{
				xtype: 'toolbar',
				title: 'Pitchforked',
				ui: 'dark',
				dock: 'top',
				items: topItems,
				defaults: { handler: nextTrack }
			}, 
			{
			    xtype: 'toolbar',
			    ui: 'dark',
			    dock: 'bottom',
				items: bottomItems,
				defaults: { handler: playPause }
			}
		]
		
		//Set up player area
		var artworkUrl = 'http://cdn.pitchfork.com/media/forget200.jpg';
		var artistName = 'Animal Collective';
		var audioPlayer = '<div id="playerArtwork" style="-webkit-box-reflect: below 10px;background:url('+artworkUrl+') no-repeat #000;background-size: 100%;height:100%;width:100%;">';
		audioPlayer += '<div id="playerMeta"><p id="playerSong">My Girls</p>';
		audioPlayer += '<p id="playerArtist">Animal Collective</p></div>'
		audioPlayer += '</div>';
		
		//Set up background (details) area
		var details = '<div id="details"><p><span id="title">Pitchfork Score</span><br/><span id="score">10.0</span></p><p id="meta"><span class="song">My Girls</span><br /><span class="album">Merriweather Post Pavilion</span><br /><span class="artist">Animal Collective</span></p></div>';
		// Init main pitchforked item
		var pitchforked = new Ext.Panel({
		    id: 'buttonsPanel',
		    layout: 'card',
		    fullscreen: true,
		    dockedItems: dockeditems,
			animation: 'flip',
			listeners: {
				afterrender: function(c){
					c.body.on('click', function(){
						if( activeCard == 0 )
						{
					    	pitchforked.setCard(1);
							activeCard = 1;
						}
						else
						{
							pitchforked.setCard(0);
							activeCard = 0;
						}
					});
				}
			},
			items: [{
				html: [audioPlayer],
			},{
				html: [details],
			}],
			
		});
		var activeCard = 0;
		pitchforked.setCard( activeCard );
		Ext.Msg.alert('Pitchforked', 'Welcome to Pitchforked, the best way to listen to Pitchfork.coms best new music. Tap OK to listen!', Ext.emptyFn);
	}
}

Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: '/img/mobile/icon.png',
    glossOnIcon: false,
    onReady: function() {
		//pitchforked.Main.init();
		pitchforked.Main.demo();
		soundManager.onready(function() {
		  if (soundManager.supported()) {
		    // soundManager.createSound() etc. may now be called
		    //pagePlayer.initDOM();
		  }
		});
	}
});