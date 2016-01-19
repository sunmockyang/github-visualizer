require 'sinatra'
require_relative "github-pr-fetch"

config_file = File.read(File.dirname(__FILE__) + '/repositories-config.json')
repo_credentials = JSON.parse(config_file)["repositories"]

pr_activities = []

repo_credentials.each { |repo|
	pr_activities.push(GithubPR.new(repo))
}

if pr_activities.empty?
	puts "You need to add at least one repository to the credentials list!"
	exit
end

get "/" do
	send_file File.expand_path(File.dirname(__FILE__) + '/../index.html')
end

get "/js/*" do
	send_file File.expand_path(File.dirname(__FILE__) + "/../js/#{params["splat"].join}")
end

get "/img/*" do
	send_file File.expand_path(File.dirname(__FILE__) + "/../img/#{params["splat"].join}")
end

get "/fonts/*" do
	send_file File.expand_path(File.dirname(__FILE__) + "/../fonts/#{params["splat"].join}")
end

# hostname:1234/all
# Get all open PRs
get '/all' do
	content_type :json
	headers 'Access-Control-Allow-Origin' => '*'

	pr_data = []
	pr_activities.each { |repo|
		pr_data += repo.fetch_all_open_pull_requests
	}
	return pr_data.to_json
end

# hostname:1234/pull/owner_name/project_name/123
# Gets PR #123 from "project_name" repository owned by "owner_name"
get '/pull/:owner/:repo/:number' do
	content_type :json
	headers 'Access-Control-Allow-Origin' => '*'

	repo = get_repository_by_owner_and_name(pr_activities, params["owner"], params["repo"])

	if !repo.nil?
		return repo.fetch_pull_request(params["number"].to_i).to_json
	end
end

# hostname:1234/pulls?pr=owner_name:project_name:123,owner_name:project_name:456
# Gets PRs:
# - #123 from "project_name" repository owned by "owner_name",
# - #456 from "project_name" repository owned by "owner_name"
get '/pulls' do
	headers 'Access-Control-Allow-Origin' => '*'
	content_type :json

	pr_data = []

	if !params.empty?
		pull_request_ids = params["pr"].split(",")

		pull_request_ids.each { |pr|
			pr_path = pr.split(":")
			repo = get_repository_by_owner_and_name(pr_activities, pr_path[0], pr_path[1])
			pr_data.push(repo.fetch_pull_request(pr_path[2].to_i))
		}
	end

	return pr_data.to_json
end

get "/test" do
	headers 'Access-Control-Allow-Origin' => '*'
	"HELLO WORLD"
end

def get_repository_by_owner_and_name(repos, owner, name)
	repos.each { |repo|
		if repo.get_owner == owner && repo.get_repo == name
			return repo
		end
	}
	return nil
end
