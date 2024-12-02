import axios from "axios"
import config from "./config.js";

const { github_token, github_api_url } = config;

const apiClient = axios.create({
    baseURL: github_api_url,
    withCredentials: false,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${github_token}`
    }
})

export function getUser() {
    return apiClient.get('/user')
}

export function getAvailableRepos(per_page, page) {
    if(!per_page) per_page = 30
    if(per_page > 100) per_page = 100
    if(!page) page = 1
    return apiClient.get(`/user/repos?per_page=${per_page}&page=${page}`)
}

export function commitsForRepo(per_page, page, owner, repo, author) {
    if(!per_page) per_page = 30
    if(per_page > 100) per_page = 100
    if(!page) page = 1
    if(!author) author = process.env['GH_LOGIN_NAME']
    return apiClient.get(`/repos/${owner}/${repo}/commits?per_page=${per_page}&page=${page}${author ? `&author=${author}` : ''}`)
}

export function getCommitDetails(owner, repo, commit_sha) {
    return apiClient.get(`/repos/${owner}/${repo}/commits/${commit_sha}`)
}