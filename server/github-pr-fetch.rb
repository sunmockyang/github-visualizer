require "json"
require "github_api"

# puts "--------------------------"
# puts "| GITHUB ACTIVITY SERVER |"
# puts "------ Sunmock Yang ------"

class GithubPR
	def initialize(owner, repo, token, client_id, client_secret)
		@owner = owner
		@repo = repo

		@gh = Github.new(oauth_token: token, client_id: client_id, client_secret: client_secret, user: owner, repo: repo)
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
			pull_requests.push GithubPR.format_pull_request(pr, comments)
		}

		return pull_requests
	end

	def fetch_pull_request(pr_number)
		pr = get_pull_request(pr_number)
		comments = get_pull_request_comments(pr_number)
		return GithubPR.format_pull_request(pr, comments)
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

		def self.format_pull_request(pr, comments)
			return {
				user: pr["user"]["login"],
				id: "#{pr["base"]["repo"]["owner"]["login"]}:#{pr["base"]["repo"]["name"]}:#{pr["number"]}",
				name: pr["number"].to_i,
				state: pr["state"],
				comments: comments.map { |comment| GithubPR.format_comment(comment) },
				repo: {"owner" => pr["base"]["repo"]["owner"]["login"], "name" => pr["base"]["repo"]["name"]}
			}
		end

		def self.format_comment(comment)
			return {
				username: comment["user"]["login"],
				id: comment["id"]
			}
		end
end
