require_relative "github-pr-fetch"

Owner = ""
Repo = ""
# Get a token from https://github.com/settings/tokens
Token = ""

pr_activity = GithubPR.new(Owner, Repo, Token)

# puts pr_activity.fetch_all_open_pull_requests.to_json
# puts pr_activity.fetch_pull_request(4710).to_json

puts pr_activity.fetch_multiple_pull_requests([4709, 4710])
