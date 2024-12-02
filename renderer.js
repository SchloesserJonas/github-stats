import chalk from 'chalk'
import filemap from "./filemap.js"

export function render(stats, lang_stats, lang_repo_stats, user_data) {
    lang_stats = objToArray(lang_stats)
    lang_repo_stats = objToArray(lang_repo_stats, "count")
    
    lang_stats.sort((a, b) => {
        return b.additions - a.additions
    })
    lang_repo_stats = lang_repo_stats.filter(item => item.lang != 'null')
    lang_repo_stats.sort((a, b) => {
        return b.count - a.count
    })
    
    console.clear()
    console.log()

    console.log(" Stats for: " + chalk.blue(user_data.name + " (" + user_data.login + ")"))
    console.log(" Public repos: " + chalk.blue(user_data.public_repos))
    console.log(" Private repos: " + chalk.blue(user_data.total_private_repos))
    console.log(" Disk usage: " + chalk.blue((user_data.disk_usage / 1000).toFixed(2) + "MB"))
    console.log(" Account created at: " + chalk.blue(new Date(user_data.created_at).toLocaleString('en-US')))

    console.log()

    console.log(chalk.cyan("========================== Total stats =========================="))
    console.log(" Total additions: " + chalk.green(stats.additions))
    console.log(" Total deletions: " + chalk.red(stats.deletions))
    console.log(" Total changes: " + chalk.yellow(stats.changes))
    console.log()
    console.log(" Total commits: " + chalk.blue(stats.commits))
    console.log(" Files committed: " + chalk.blue(stats.files_committed))
    console.log(" Files created: " + chalk.blue(stats.files_created))
    console.log(chalk.cyan("================================================================="))

    console.log()

    console.log(chalk.cyan("===================== Commit Language stats ====================="))
    for(var i = 0; i < lang_stats.length; i++) {
        console.log(" " + chalk.blue(filemap.filemap[lang_stats[i].lang] ? filemap.filemap[lang_stats[i].lang] : lang_stats[i].lang) + ": " + chalk.green(lang_stats[i].additions) + " additions, " + chalk.red(lang_stats[i].deletions) + " deletions, " + chalk.yellow(lang_stats[i].changes) + " changes")
    }
    console.log(chalk.cyan("================================================================="))

    console.log()

    console.log(chalk.cyan("====================== Repo Language stats ======================"))
    for(var i = 0; i < lang_repo_stats.length; i++) {
        console.log(" " + chalk.green(lang_repo_stats[i].lang) + ": " + chalk.yellow(lang_repo_stats[i].count + " repos"))
    }
    console.log(chalk.cyan("================================================================="))

    console.log()
}


function objToArray(obj, data_name) {
    var arr = []
    for(var i = 0; i < Object.keys(obj).length; i++) {
        if(typeof Object.values(obj)[i] == "object") {
            arr.push(Object.assign({}, { lang: Object.keys(obj)[i] }, Object.values(obj)[i]))
        } else {
            if(!data_name) data_name = value

            var subObj = {}
            subObj[data_name] = Object.values(obj)[i]
            arr.push(Object.assign({}, { lang: Object.keys(obj)[i] }, subObj))
        }
    }
    return arr
}