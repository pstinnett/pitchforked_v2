require 'rubygems'
require 'sinatra'
require 'environment'

# Define the Albums model
class Album
  include DataMapper::Resource
  
  property :id, Serial
  property :name, String, :length => 255
  property :is_enabled, Boolean
  property :pf_score, Float
  property :pf_url, String, :length => 255
  property :artwork_url, String, :length => 255
  property :artist_id, Integer, :min => 1
  property :record_label, String, :length => 255
  property :year, String, :length => 255
  property :pf_date, String, :length => 255
  property :created_at, DateTime
  property :updated_at, DateTime
  has n, :tracks
end

# Define the Artists model
class Artist
  include DataMapper::Resource
  
  property :id, Serial
  property :name, String, :length => 255
  property :url_name, String, :length => 255
  property :is_enabled, Boolean
  property :created_at, DateTime
  property :updated_at, DateTime
  has n, :albums
  has n, :tracks, :through => :albums
end

# Define the Tracks model
class Track
  include DataMapper::Resource
  
  property :id, Serial, :key => true
  property :name, String, :length => 255
  property :mp3_url, String, :length => 255
  property :play_count, Integer
  property :artist_id, Integer, :key => true, :min => 1
  property :album_id, Integer, :key => true, :min => 1
  property :created_at, DateTime
  property :updated_at, DateTime
  belongs_to :artist
  belongs_to :album
end

# Automatically create the tables if they don't exist
DataMapper.auto_upgrade!

configure do
  set :views, "#{File.dirname(__FILE__)}/views"
end

error do
  e = request.env['sinatra.error']
  Kernel.puts e.backtrace.join("\n")
  'Application error'
end

helpers do
end #end helpers

before do
 
end # before filter

get '/', :agent => /iPhone/ do
    erb :root, :layout => :layout_mobile
end

# root page
get '/' do
  erb :root, :layout => @layout
end

get '/admin' do
  erb :admin
end

get '/next' do
  content_type :json
  id = (1+rand(Track.count).to_i)
  tracks = Track.all(:id => id) 
  @track = tracks.first
  { :name => @track.name, 
    :mp3_url => @track.mp3_url, 
    :artist => @track.artist.name, 
    :album => @track.album.name,
    :artwork_url => @track.album.artwork_url,
    :score => @track.album.pf_score,
    :review_url => @track.album.pf_url
  }.to_json
  erb :next
end

# scrape page
get '/scrape' do
  @artists = []
  2.times do |i|
    if i > 0
      page = Nokogiri::HTML(open('http://pitchfork.com/reviews/best/albums/' + i.to_s))
      items = page.xpath('//div[@class="panel"]/div/div[1]').children.each do |panel|
        #do Nokogiri! searches and set as temporary variables to use when saving
        artist_name = Nokogiri.parse(panel.inner_html).xpath("//span[@class='artists']/a/b").inner_html
        album_name = Nokogiri.parse(panel.inner_html).xpath("//span[@class='albums']/a").inner_html
        review_score = Nokogiri.parse(panel.inner_html).xpath("//div[@class='large_rating']").inner_html
        review_url = Nokogiri.parse(panel.inner_html).xpath("//span[@class='albums']/a/@href").text
        album_art = Nokogiri.parse(panel.inner_html).xpath("//img[@class='tombstone-cover-image']/@src").text
        record_label = Nokogiri.parse(panel.inner_html).xpath("//span[@class='labels']/a").inner_html
        review_page = Nokogiri::HTML(open("http://www.pitchfork.com" + review_url.to_s))
        credits = Nokogiri.parse(review_page.inner_html).xpath("//p[@class='credits']").inner_html.to_s
        regexp = /(?=(January|February|March|April|May|June|July|August|September|October|November|December)).*/
        year = Nokogiri.parse(panel.inner_html).xpath("//span[@class='labels']").children.select{|e| e.text?} 
        #find artist name and save
        if artist_name.length > 0
          @new_artist = Artist.new
            @new_artist.attributes = { 
              :name => artist_name, 
              :url_name => artist_name.to_s.gsub(/[ ]|[$]|[?]|[%]/, "+").downcase, 
              :is_enabled => 1
            }
          @new_artist.save
          @new_album = Album.new
            @new_album.attributes = {
              :artist_id => @new_artist.id,
              :name => album_name,
              :is_enabled => 1,
              :pf_score => review_score.to_f,
              :pf_url => "http://www.pitchfork.com" + review_url.to_s,
              :artwork_url => album_art.to_s,
              :pf_date => credits.match(regexp).to_s,
              :record_label => record_label.to_s,
              :year => year.join.to_s.gsub(/[^0-9]/, '').to_i
           }
          @new_album.save
          @artists << @new_artist
        end
      end
    end
  end
  erb :scrape
end

# import page
get '/import/:id' do
  @success = []
  creds = 'niwCFilfWCZqF' + ':' + '0c8e7f31519d0b9d576405e0cb4f0b037fcfa4ec'
  url = 'http://' + creds + '@api.8tracks.com/'

  
  if params[:id] != nil     #This imports tracks based on an artist ID
    id = params[:id].to_i
    artist = Artist.get(id)
    page = 1
    while page < 4 do
      puts url + 'mixes.json?q=' + artist.url_name + '&sort=recent&page=' + page.to_s
      mix_r = RestClient.get url + 'mixes.json?q=' + artist.url_name + '&sort=recent&page=' + page.to_s
      mixes_arr = JSON.parse(mix_r)

      mixes_arr['mixes'].each do |mix|
        playtoken_r = RestClient.get url + '/sets/new.json', 
          :headers => { 
            :content_type => 'text/xml', 
          }
        j = JSON.parse(playtoken_r)
        playtoken = j['play_token']
        @playtoken = playtoken
        puts url + 'sets/' + playtoken + '/play.json?mix_id=' + mix['id'].to_s
        i=1
        while i < 3 do
          if i == 1
            track_r = RestClient.get url + 'sets/' + playtoken + '/play.json?mix_id=' + mix['id'].to_s
          else
            track_r = RestClient.get url + 'sets/' + playtoken + '/skip.json?mix_id=' + mix['id'].to_s
          end
          tracks_arr = JSON.parse(track_r)
          track = tracks_arr['set']['track']
          if track['performer'].to_s == artist.name
            #check for matching album in DB
            puts 'track found!'
            album = Album.first( :name => track['release_name'] )
            if album != nil
              album_id = album.id
            else
              album_id = 0
            end

            @new_track = Track.first_or_create({ :name => track['name'], :artist_id => id }, {
                :name => track['name'],
                :mp3_url => track['url'].gsub(/.64k.m4a/, '.mp3'),
                :play_count => 0,
                :artist_id => id,
                :album_id => album_id
              })
              @new_track.save
              @success << @new_track
          end
          i += 1 
        end
      end
      page += 1
    end    
  end
  erb :import
end
