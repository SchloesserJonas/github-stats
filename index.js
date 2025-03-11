import { getUser, getAvailableRepos, commitsForRepo, getCommitDetails } from "./service.js"
import { render } from "./renderer.js"
import ignorelist from "./ignorelist.js"
const { ignored_file_types, ignored_files } = ignorelist
import custom_ignores from './custom-ignores.js'
const custom_ignore = custom_ignores.custom_ignore

const LOGGER = false

var user_data = await setup()

var start = new Date().getTime()
var end

// fetch repos
var repos = []
var pages = 1
for(var i = 1; i <= pages; i++) {
    var repos_full = await fetchRepos(i)
    if(repos_full.length != 0) pages++
    repos_full.forEach(repo => {
        repos.push({
            name: repo.name,
            full_name: repo.full_name,
            owner: repo.owner.login,
            language: repo.language,
            commits: []
        })
        if(LOGGER) console.log("fetched Reposity " + repo.full_name)
    })
}

// fetch commits for repo
for(var i = 0; i < repos.length; i++) {
    var pages = 1
    for(var j = 1; j <= pages; j++) {
        var comits_full = await fetchCommitsForRepo(j, repos[i].owner, repos[i].name)
        if(comits_full.length != 0) pages++
        comits_full.forEach(comit => {
            repos[i].commits.push({
                sha: comit.sha
            })
            if(LOGGER) console.log("fetched commit " + comit.sha + " in repo " + repos[i].full_name)
        })
    }
    if(LOGGER) console.log("finished fetching " + repos[i].full_name)
}

// fetch stats for commits
var stats = {total: 0, additions: 0, deletions: 0, changes: 0, commits: 0, files_committed: 0, files_created: 0}
var lang_stats = {}
var lang_repo_stats = {}
for(var i = 0; i < repos.length; i++) {
    stats.commits += repos[i].commits.length
    for(var j = 0; j < repos[i].commits.length; j++) {
        var stats_full = await fetchCommitDataForComit(repos[i].owner, repos[i].name, repos[i].commits[j].sha)
        stats.additions += stats_full.stats.additions
        stats.deletions += stats_full.stats.deletions
        stats.total += stats_full.stats.total
        stats.files_committed += stats_full.files.length

        for(var k = 0; k < stats_full.files.length; k++) {
            var full_filename = stats_full.files[k].filename
            var filename = stats_full.files[k].filename.split('/')[stats_full.files[k].filename.split('/').length -1]
            var file_type = filename.split('.')[filename.split('.').length - 1]

            if(ignored_file_types.includes(file_type) ||
               ignored_files.includes(filename) ||
               filename.startsWith('.') ||
               full_filename.startsWith('.') ||
               !filename.includes('.')) {
                stats.additions -= stats_full.files[k].additions
                stats.deletions -= stats_full.files[k].deletions
                continue
            }
            if(custom_ignore.some(entry => entry.repo == repos[i].full_name)) {
                console.log(custom_ignore.find(entry => entry.repo == repos[i].full_name))
                console.log(full_filename, filename, file_type)
                if(custom_ignore.find(entry => entry.repo == repos[i].full_name).ignore_ft.includes(file_type) ||
                custom_ignore.find(entry => entry.repo == repos[i].full_name).ignore.includes(filename)) {
                    stats.additions -= stats_full.files[k].additions
                    stats.deletions -= stats_full.files[k].deletions
                    continue
                }
            }

            if(stats_full.files[k].status == "added") stats.files_created += 1

            if(lang_stats[file_type]) {
                lang_stats[file_type].additions += stats_full.files[k].additions
                lang_stats[file_type].deletions += stats_full.files[k].deletions
                lang_stats[file_type].changes += stats_full.files[k].changes
            } else {
                lang_stats[file_type] = {
                    additions: stats_full.files[k].additions,
                    deletions: stats_full.files[k].deletions,
                    changes: stats_full.files[k].changes
                }
            }
            stats.changes += stats_full.files[k].changes
            if(LOGGER) console.log("computed file " + filename + " from commit " + repos[i].commits[j].sha + " in repo " + repos[i].full_name)
        }
        if(LOGGER) console.log("fetched stats for commit " + repos[i].commits[j].sha + " in repo " + repos[i].full_name)
    }
    if(lang_repo_stats[repos[i].language]) {
        lang_repo_stats[repos[i].language]++
    } else {
        lang_repo_stats[repos[i].language] = 1
    }
}

// render stats
end = new Date().getTime()
render(stats, lang_stats, lang_repo_stats, user_data)

console.log("Time elapsed: " + (((end - start) / 1000) / 60).toFixed(2) + " minutes")

async function setup(page) {
    return new Promise(resolve => {
        getUser()
        .then((data) => {
            process.env['GH_LOGIN_NAME'] = data.data.login
            resolve(data.data)
        })
        .catch((err) => {
            process.kill(0)
        })
    });
}

async function fetchRepos(page) {
    return new Promise(resolve => {
        getAvailableRepos(100, page)
        .then((data) => {
            resolve(data.data)
        })
    });
}

async function fetchCommitsForRepo(page, owner, repo) {
    return new Promise(resolve => {
        commitsForRepo(100, page, owner, repo)
        .then((data) => {
            resolve(data.data)
        })
        .catch((err) => {
            resolve([])
        })
    })
}

async function fetchCommitDataForComit(owner, repo, commit_sha) {
    return new Promise(resolve => {
        getCommitDetails(owner, repo, commit_sha)
        .then((data) => {
            resolve({files: data.data.files, stats: data.data.stats})
        })
    })
}