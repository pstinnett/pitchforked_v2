require 'application'

set :environment, :development
disable :run

require File.join(File.dirname(__FILE__), 'application.rb')
run Sinatra::Application