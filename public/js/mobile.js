Ext.ns('pitchforked');

var soundManagerHtml = '<div id="control-template"><div class="controls"><div class="statusbar"><div class="loading"></div><div class="position"></div></div></div><div class="timing"><div id="sm2_timing" class="timing-data"><span class="sm2_position">%s1</span> / <span class="sm2_total">%s2</span></div></div><div class="peak"><div class="peak-box"><span class="l"></span><span class="r"></span></div></div></div><div id="spectrum-container" class="spectrum-container"><div class="spectrum-box"><div class="spectrum"></div></div></div><ul class="playlist"><li><a href="http://8tracks.s3.amazonaws.com/tf/001/046/252/59799.mp3">Crash cymbal</a></li><li><a href="http://8tracks.s3.amazonaws.com/tf/001/046/252/59799.mp3">Crash cymbal</a></li></ul><div id="sm2-container"></div>';

pitchforked.Main = {
	demo : function() {
		//this handles the taps. may need to be expanded.
		var flipCard = function (btn, evt) {
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
		var firstPlay = true;
		
		var makeAjaxRequest = function() {
			if( firstPlay == true )
			{
				firstPlay = false;
				if (("standalone" in window.navigator) && !window.navigator.standalone)
				{
					if (!this.popup)
					{
					      this.popup = new Ext.Panel({
					          floating: true,
					          modal: true,
					          centered: true,
							  width: '300px',
							  height: '330px',
					          styleHtmlContent: true,
					          html: '<div>Use the <strong>"Add to Home Screen"</strong> function and place an icon on your home screen to run this ' + 'application in full screen mode like a native app. Just tap <strong>"+"</strong> and then <strong>"Add to Home Screen."</strong><br /><br /><strong>Note:</strong> If you would like to listen to the audio in the background, just tap outside of the border of this message and run Pitchforked within Safari.</div>',
					          dockedItems: [{
					              dock: 'top',
					              xtype: 'toolbar',
					              title: 'Install Pitchforked!'
					          }],
					          scroll: 'vertical',
					      });
					}
					this.popup.show();
				}
			}
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
			{ iconMask: true, iconCls: 'tag', handler: flipCard }	
		]
		var bottomItems = [
			{ xtype: 'spacer' },
			{ iconMask: true, iconCls: 'pause', iconAlign: 'center', handler: playPause },
			{ iconMask: true, iconCls: 'next', iconAlign: 'center', handler: makeAjaxRequest },
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
			scroll: 'vertical',
			tpl: [
			'<tpl for=".">',
			  '<div id="details">',
			  '<p><span id="title">Pitchfork Rating</span></p>',
			  '<p class="score_cont"><img src="/img/mobile/rating.png" /><span id="score">{score}</span></p>',
			  '<p><img class="note" src="/img/mobile/note.png" /></p>',
			  '<p id="meta"><span class="song">{name}</span><br />',
			  '<span class="album">{album}</span><br />', 
			  '<span class="artist">{artist}</span></p>',
			  '</div>',
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
		//if (("standalone" in window.navigator) && window.navigator.standalone)
		Ext.Msg.alert('Pitchforked', 'Welcome to Pitchforked, a new way to listen to Pitchfork.com\'s best new music. <br /><br />Tap OK to listen!', makeAjaxRequest);
	}
}

readReview = function(url) {
	window.open(url);
}

Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: '/img/mobile/start-bg.png',
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