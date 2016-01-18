# require "ghee"
require "json"
require "github_api"

# puts "--------------------------"
# puts "| GITHUB ACTIVITY SERVER |"
# puts "------ Sunmock Yang ------"

Owner = ""
Repo = ""
Token = ""

class GithubPR
	def initialize(owner, repo, token)
		@owner = owner
		@repo = repo

		@gh = Github.new(oauth_token: token, user: owner, repo: repo)
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
			@gh.pull_requests.comments.list(user:Owner, repo:Repo, number:number).each { |comment| comments.push comment }
			@gh.issues.comments.list(user:Owner, repo:Repo, number:number).each { |comment| comments.push comment }
			return comments
		end

		def self.format_pull_request(pr, comments)
			return {
				user: pr["user"]["login"],
				number: pr["number"],
				state: pr["state"],
				comments: comments.map { |comment| GithubPR.format_comment(comment) }
			}
		end

		def self.format_comment(comment)
			return {
				user: comment["user"]["login"],
				id: comment["id"]
			}
		end
end

pr_activity = GithubPR.new(Owner, Repo, Token)

# puts pr_activity.fetch_all_open_pull_requests.to_json
# puts pr_activity.fetch_pull_request(4710).to_json

puts pr_activity.fetch_multiple_pull_requests([4709, 4710])
