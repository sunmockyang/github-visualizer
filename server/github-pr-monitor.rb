require_relative "github-pr-fetch"

Owner = ""
Repo = ""
# Get a token from https://github.com/settings/tokens
Token = ""

pr_activity = GithubPR.new(Owner, Repo, Token)

# puts pr_activity.fetch_all_open_pull_requests.to_json
# puts pr_activity.fetch_pull_request(4710).to_json

# puts pr_activity.fetch_multiple_pull_requests([4709, 4710])

require 'sinatra'

get '/all' do
  pr_activity.fetch_all_open_pull_requests.to_json
end

get '/pull/:number' do |num|
	pr_activity.fetch_pull_request(num.to_i).to_json
end

get '/pulls/:numbers' do |nums|
	numbers = nums.split(",")
	numbers.map { |str| str.to_i }
	pr_activity.fetch_multiple_pull_requests(numbers).to_json
end
