require 'application'

set :environment, :production
disable :run

require File.join(File.dirname(__FILE__), 'application.rb')
run Sinatra::Application