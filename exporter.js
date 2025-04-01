import filemap from "./filemap.js"
import fs from 'fs'

export function exporter(stats, lang_stats, lang_repo_stats, user_data) {

    lang_stats = objToArray(lang_stats)
    lang_repo_stats = objToArray(lang_repo_stats, "count")
    
    lang_stats.sort((a, b) => {
        return b.additions - a.additions
    })
    lang_repo_stats = lang_repo_stats.filter(item => item.lang != 'null')
    lang_repo_stats.sort((a, b) => {
        return b.count - a.count
    })

    var total_stats = {}
    total_stats.additions = stats.additions
    total_stats.deletions = stats.deletions
    total_stats.changes = stats.changes

    total_stats.commits = stats.commits
    total_stats.committed_files = stats.files_committed
    total_stats.created_files = stats.files_created

    total_stats.languages = []
    for(var i = 0; i < lang_stats.length; i++) {
        var lang_stat = {}
        lang_stat.name = filemap.filemap[lang_stats[i].lang] ? filemap.filemap[lang_stats[i].lang] : lang_stats[i].lang
        lang_stat.additions = lang_stats[i].additions
        lang_stat.deletions = lang_stats[i].deletions
        lang_stat.changes = lang_stats[i].changes
        total_stats.languages.push(lang_stat)
    }

    total_stats.repo_langs = []
    for(var i = 0; i < lang_repo_stats.length; i++) {
        var lang_stat = {}
        lang_stat.name = lang_repo_stats[i].lang
        lang_stat.count = lang_repo_stats[i].count
        total_stats.repo_langs.push(lang_stat)
    }

    total_stats = JSON.stringify(total_stats, null, 2)
    try {
        var date = new Date()
        date = date.toISOString().split('T')[0]
        if(!fs.existsSync('./exports')) {
            fs.mkdirSync('./exports')
        }
        fs.writeFileSync(`./exports/stats-${date}.json`, total_stats)
        return `./exports/stats-${date}.json`
    } catch(err) {
        throw err
        return false
    }
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