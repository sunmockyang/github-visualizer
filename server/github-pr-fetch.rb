require "json"
require "github_api"

# puts "--------------------------"
# puts "| GITHUB ACTIVITY SERVER |"
# puts "------ Sunmock Yang ------"

class GithubPR
	def initialize(config)
		@owner = config["owner"]
		@repo = config["repository"]

		@pr_colour = config["pr_colour"]
		@comment_colour = config["comment_colour"]

		@gh = Github.new(oauth_token: config["token"], client_id: config["client_id"], client_secret: config["client_secret"], user: config["owner"], repo: config["repository"])
	end

	def get_owner
		@owner
	end

	def get_repo
		@repo
	end

	def fetch_all_open_pull_requests
		pull_requests = []
		get_all_open_pull_requests.each { |pr|
			comments = get_pull_request_comments(pr["number"])
			pull_requests.push format_pull_request(pr, comments)
		}

		return pull_requests
	end

	def fetch_pull_request(pr_number)
		pr = get_pull_request(pr_number)
		comments = get_pull_request_comments(pr_number)
		return format_pull_request(pr, comments)
	end

	# pr_numbers: array of numbers
	def fetch_multiple_pull_requests(pr_numbers)
		pull_requests = []

		pr_numbers.each { |id| pull_requests.push(fetch_pull_request(id)) }

		return pull_requests
	end

	private
		def get_all_open_pull_requests
			@gh.pull_requests.list
		end

		def get_pull_request(number)
			@gh.pull_requests.get(number:number)
		end

		def get_pull_request_comments(number)
			comments = []
			@gh.pull_requests.comments.list(user:@owner, repo:@repo, number:number).each { |comment| comments.push comment }
			@gh.issues.comments.list(user:@owner, repo:@repo, number:number).each { |comment| comments.push comment }
			return comments
		end

		def format_pull_request(pr, comments)
			return {
				user: pr["user"]["login"],
				repo: {"owner" => pr["base"]["repo"]["owner"]["login"], "name" => pr["base"]["repo"]["name"]},
				id: "#{pr["base"]["repo"]["owner"]["login"]}:#{pr["base"]["repo"]["name"]}:#{pr["number"]}",
				name: pr["number"].to_i,
				state: pr["state"],
				colour: @pr_colour,
				comments: comments.map { |comment| format_comment(comment) }
			}
		end

		def format_comment(comment)
			return {
				username: comment["user"]["login"],
				id: comment["id"],
				colour: @comment_colour
			}
		end
end
