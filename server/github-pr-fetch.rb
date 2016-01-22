require "json"
require "github_api"
require 'thread'

# puts "--------------------------"
# puts "| GITHUB ACTIVITY SERVER |"
# puts "------ Sunmock Yang ------"

# Cache entry model:
# cache[PR_NUMBER] = {
# 	time_retrieved: Time,
# 	data: PRData,
# 	comments: CommentData
# }

class GithubPRDataModel

	def initialize(config)
		@CACHE_AGE_LIMIT = 5 * 60
		@config = config
		@owner = config["owner"]
		@repo = config["repository"]

		@pr_colour = config["pr_colour"]
		@comment_colour = config["comment_colour"]

		@cache = {}
		
		@all_pr_mutex = Mutex.new
		@master_comment_mutex = Mutex.new
		@comment_mutexes = {}
		@master_pr_mutex = Mutex.new
		@pr_mutexes = {}

		@gh_hits = 0

		@gh = Github.new(oauth_token: config["token"], client_id: config["client_id"], client_secret: config["client_secret"], user: config["owner"], repo: config["repository"])
	end

	def get_owner
		@owner
	end

	def get_repo
		@repo
	end

	def get_cache
		@cache
	end

	def get_configuration
		config = @config.clone
		config.delete("token")
		return config
	end

	def fetch_all_open_pull_requests
		pull_requests = []
		get_all_open_pull_requests.each { |pr|
			pr[:comments] = get_pull_request_comments(pr[:name])
			pull_requests.push(pr)
		}

		return pull_requests
	end

	def fetch_pull_request(pr_number)
		pr = get_pull_request(pr_number)
		pr[:comments] = get_pull_request_comments(pr_number)
		return pr
	end

	# pr_numbers: array of numbers
	def fetch_multiple_pull_requests(pr_numbers)
		pull_requests = []

		pr_numbers.each { |id| pull_requests.push(fetch_pull_request(id)) }

		return pull_requests
	end

	private
		def format_pull_request(pr)
			return {
				user: pr["user"]["login"],
				repo: {"owner" => pr["base"]["repo"]["owner"]["login"], "name" => pr["base"]["repo"]["name"]},
				id: "#{pr["base"]["repo"]["owner"]["login"]}:#{pr["base"]["repo"]["name"]}:#{pr["number"]}",
				name: pr["number"].to_i,
				state: pr["state"],
				colour: @pr_colour,
				url: pr["html_url"],
				comments: nil
			}
		end

		def format_comment(comment)
			return {
				username: comment["user"]["login"],
				id: comment["id"],
				timeCreated: comment["created_at"],
				url: comment["html_url"],
				colour: @comment_colour
			}
		end

		def get_all_open_pull_requests
			@all_pr_mutex.synchronize do
				if @cache.empty? || !valid_entry?(get_oldest_pull_request)
					@gh_hits += 1
					puts "GET ALL OPEN PRs: #{@gh_hits}"

					# Cache the entries
					current_time = Time.now
					response = @gh.pull_requests.list
					@cache.clear
					response.each { |pr|
						@cache[pr["number"].to_i] = new_cache_entry
						@cache[pr["number"].to_i][:pull_request] = format_pull_request(pr)
					}
				else
					puts "[CACHE] - GET ALL OPEN PRs: #{@gh_hits}"
				end

				open_prs = []
				@cache.each {|key, entry|
					open_prs.push(entry[:pull_request])
				}

				return open_prs
			end
		end

		def get_pull_request(number)
			pr = nil

			@master_pr_mutex.synchronize do
				if @pr_mutexes[number].nil?
					@pr_mutexes[number] = Mutex.new
				end
			end

			@pr_mutexes[number].synchronize do
				if !valid_entry?(@cache[number])
					@gh_hits += 1
					puts "GET PR ##{number}: #{@gh_hits}"

					pr = format_pull_request(@gh.pull_requests.get(number:number))
					
					# Only cache if the pr is open
					if pr[:state] == "open"
						if !valid_entry?(@cache[number])
							@cache[number] = new_cache_entry
						end
						@cache[number][:pull_request] = pr
						@cache[number][:comments] = nil
					end
				else
					pr = @cache[number][:pull_request]
					puts "[CACHE] - GET PR ##{number}: #{@gh_hits}"
				end
			end

			@master_pr_mutex.synchronize do
				@pr_mutexes.delete(number)
			end

			return pr
		end

		def get_pull_request_comments(number)
			comments = []

			@master_comment_mutex.synchronize do
				if @comment_mutexes[number].nil?
					@comment_mutexes[number] = Mutex.new
				end
			end

			@comment_mutexes[number].synchronize do
				if !valid_entry?(@cache[number]) || @cache[number][:comments].nil?
					@gh_hits += 2
					puts "GET COMMENTS FOR PR ##{number}: #{@gh_hits}"
					@gh.pull_requests.comments.list(user:@owner, repo:@repo, number:number).each { |comment| comments.push comment }
					@gh.issues.comments.list(user:@owner, repo:@repo, number:number).each { |comment| comments.push comment }
					comments.map! { |comment| format_comment(comment) }
					# Only cache if the PR is available in the cache
					if valid_entry?(@cache[number])
						@cache[number][:comments] = comments
					end
				else
					comments = @cache[number][:comments]
					puts "[CACHE] - GET COMMENTS FOR PR ##{number}: #{@gh_hits}"
				end
			end
			@master_comment_mutex.synchronize do
				@comment_mutexes.delete(number)
			end

			return comments
		end

		def get_oldest_pull_request
			oldest = nil
			@cache.each { |key, cache_entry|
				if oldest.nil? ||  get_cache_entry_age(cache_entry) > get_cache_entry_age(oldest)
					oldest = cache_entry
				end
			}
			return oldest
		end

		def valid_entry?(cache_entry)
			valid = !cache_entry.nil? &&
				get_cache_entry_age(cache_entry) < @CACHE_AGE_LIMIT &&
				(cache_entry[:pull_request].nil? || cache_entry[:pull_request][:state] == "open")
			return valid
		end

		def get_cache_entry_age(cache_entry)
			if cache_entry.nil?
				return @CACHE_AGE_LIMIT + 1000
			else
				return Time.now - cache_entry[:time_retrieved]
			end
		end

		def new_cache_entry
			{
				time_retrieved: Time.now,
				pull_request: nil,
				comments: nil
			}
		end
end
