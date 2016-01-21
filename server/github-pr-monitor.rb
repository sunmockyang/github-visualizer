require 'sinatra'
require_relative "github-pr-fetch"

config_file = File.read(File.dirname(__FILE__) + '/repositories-config.json')
repo_configs = JSON.parse(config_file)["repositories"]
all_config = JSON.parse(config_file)["all-repositories"]

pr_activities = []

repo_configs.each { |repo|
	pr_activities.push(GithubPRDataModel.new(repo))
}

if pr_activities.empty?
	puts "You need to add at least one repository to the credentials list!"
	exit
end

set :port, 8080
set :bind, '0.0.0.0'
set :logging, false

# ############## #
# API END POINTS #
# ############## #

# hostname:1234/all
# Get all open PRs
get '/api/all' do
	content_type :json
	headers 'Access-Control-Allow-Origin' => '*'

	pr_data = []
	pr_activities.each { |repo|
		pr_data += repo.fetch_all_open_pull_requests
	}
	return pr_data.to_json
end

get '/:owner/:repo/api/all' do
	content_type :json
	headers 'Access-Control-Allow-Origin' => '*'

	pr_data = []
	repo = get_repository_by_owner_and_name(pr_activities, params["owner"], params["repo"])
	if !repo.nil?
		pr_data = repo.fetch_all_open_pull_requests
	end
	return pr_data.to_json
end

# hostname:1234/pull/owner_name/project_name/123
# Gets PR #123 from "project_name" repository owned by "owner_name"
get '/:owner/:repo/api/pull/:number' do
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
get '/api/pulls' do
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

get "/api/cache" do
	headers 'Access-Control-Allow-Origin' => '*'
	content_type :json

	cache = {}
	pr_activities.each { |repo|
		cache[repo.get_repo] = repo.get_cache
	}
	return cache.to_json
end


["", "/:owner/:name"].each do |dir|
	get "#{dir}/api/configuration.js" do
		headers 'Access-Control-Allow-Origin' => '*'
		content_type :js

		config = {}
		if !params["owner"].nil? && !params["name"].nil?
			config = get_repository_by_owner_and_name(pr_activities, params["owner"], params["name"]).get_configuration
		else
			config = all_config
		end

		return "var GVConfig = #{config.to_json};"
	end
end

get "/api/test" do
	headers 'Access-Control-Allow-Origin' => '*'
	"HELLO WORLD"
end

# ########### #
# SERVE FILES #
# ########### #

["", "index.html"].each do |path|
	get "/#{path}" do
		send_file File.expand_path(File.dirname(__FILE__) + '/../index.html')
	end

	get "/:owner/:name/#{path}" do
		send_file File.expand_path(File.dirname(__FILE__) + '/../index.html')
	end
end

["/js", "/img", "/fonts"].each do |dir|
	["#{dir}/*", "/:owner/:name#{dir}/*"].each do |path|
		get path do
			send_file File.expand_path(File.dirname(__FILE__) + "/../#{dir}/#{params["splat"].join}")
		end
	end
end

def get_repository_by_owner_and_name(repos, owner, name)
	repos.each { |repo|
		if repo.get_owner == owner && repo.get_repo == name
			return repo
		end
	}
	return nil
end
