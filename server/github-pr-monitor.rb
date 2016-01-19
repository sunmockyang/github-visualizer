require 'sinatra'
require_relative "github-pr-fetch"

Owner = ""
Repo = ""
# Get a token from https://github.com/settings/tokens
Token = ""

pr_activity = GithubPR.new(Owner, Repo, Token)

# hostname:1234/all
# Get all open PRs
get '/all' do
	content_type :json
	headers 'Access-Control-Allow-Origin' => '*'
	pr_activity.fetch_all_open_pull_requests.to_json
end

# hostname:1234/pull/123
# Gets PR #123
get '/pull/:number' do |num|
	headers 'Access-Control-Allow-Origin' => '*'
	content_type :json
	pr_activity.fetch_pull_request(num.to_i).to_json
end

# hostname:1234/pulls/123,456
# Gets PRs #123, #456
get '/pulls/:numbers' do |nums|
	headers 'Access-Control-Allow-Origin' => '*'
	content_type :json
	numbers = nums.split(",")
	numbers.map { |str| str.to_i }
	pr_activity.fetch_multiple_pull_requests(numbers).to_json
end

get "/test" do
	headers 'Access-Control-Allow-Origin' => '*'
	"HELLO WORLD"
end
