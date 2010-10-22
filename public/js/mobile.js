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
			soundManager.togglePause('mySound');
		}
		
		var nextTrack = function (btn, evt) {
			alert('next track buttn');
		}
		
		var makeAjaxRequest = function() {
			Ext.Ajax.request({
            	url: '/next',
				method: 'GET',
		        jsonData: {success : 'true'},
		        success: 
		            function(result, request) {
						var jsonData = Ext.util.JSON.decode(result.responseText);
		                audioPlayer.update(jsonData);
						details.update(jsonData);
						soundManager.destroySound('mySound');
						soundManager.play(
							'mySound', {
								url: jsonData.mp3_url,
								onfinish: makeAjaxRequest
							}
						);
		            },
		        failure: 
		            function(result, request) {
		                alert('Failed to load song: ' + result.responseText);
		            }
        	});
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
				defaults: { handler: makeAjaxRequest }
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
		var audioPlayer = new Ext.Component({
			title: 'AudioPlayer',
			cls: 'audioplayer',
			tpl: [              // Set up a template to display tweet data
			'<tpl for=".">',
			  '<div id="playerArtwork" style="background:url({artwork_url}) no-repeat #000;">',
			    '<div id="playerMeta"><p id="playerSong">{title}</p>',
			    '<p id="playerArtist">{artist}</p></div>',
			  '</div>',
			'</tpl>'
			]
		});
		
		var details = new Ext.Component({
			title: 'Details',
			cls: 'details',
			tpl: [
			'<tpl for=".">',
			  '<div id="details">',
			  '<p><span id="title">Pitchfork Score</span><br/>',
			  '<span id="score">{score}</span></p>',
			  '<p id="meta"><span class="song">{name}</span><br />',
			  '<span class="album">{album}</span><br />', 
			  '<span class="artist">{artist}</span></p></div>',
			'</tpl>'
			]
		});

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
			items: [audioPlayer, details],
			
		});
		var activeCard = 0;
		pitchforked.setCard( activeCard );
		Ext.Msg.alert('Pitchforked', 'Welcome to Pitchforked, the best way to listen to Pitchfork.coms best new music. Tap OK to listen!', makeAjaxRequest);
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
		    pagePlayer.initDOM();
		  }
		});
	}
});