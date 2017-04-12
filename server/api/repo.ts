import {http, HttpResponse, btoa, atob} from "../helpers";
import * as logger from "../logger";

const PAGE_SIZE = 100;
const username = "oricalvo";
const password = "hello05";
const headers = {
    "Authorization": "Basic " + atob(username + ":" + password),
    "User-Agent": "repo-explorer",
};

export interface RepoMetadata {
    path: string;
}

export interface Repo extends RepoMetadata {
    name: string;
}

export function registerRepoApi(router) {
    router.get("/repo", getAllRepos);
}

//
//  A page contains multiple repos
//
function getPage(index): Promise<HttpResponse> {
    console.log("getPage", index);

    return http({
        method: "GET",
        url: `https://api.github.com/user/repos?page=${index}&per_page=${PAGE_SIZE}`,
        headers: headers,
    });
}

function deleteRepo(repoName: string): Promise<HttpResponse> {
    return this.http.delete(`https://api.github.com/repos/${username}/${repoName}`, {
        headers: headers,
    });
}

function getLastPageIndex(response: HttpResponse) {
    let index = -1;

    const link = response.headers["link"];
    if(link) {
        const regExp = /\?page=(\d)*/g;
        while (true) {
            var res = regExp.exec(link);
            if (!res) {
                break;
            }

            index = parseInt(res[1]);
        }
    }

    return index;
}

function collectReposFromPageResponse(page: HttpResponse): Repo[] {
    return JSON.parse(page.body).map(r => ({
        name: r.name,
        path: null,
    }));
}

async function getAllRepos(): Promise<Repo[]> {
    let firstPage: HttpResponse = await getPage(1);
    const lastPageIndex = getLastPageIndex(firstPage);

    const additional = [];
    for (let i = 2; i <= lastPageIndex; i++) {
        additional.push(getPage(i).then(res => collectReposFromPageResponse(res)));
    }

    return Promise.all(additional)
        .then(pages => {
            const repos = Array.prototype.concat.apply(collectReposFromPageResponse(firstPage), pages);
            return repos;
        })
        .then(repos => {
            return Promise.all(repos.map(r => loadRepoDetails(r))).then(()=> {
                return repos.filter(r=>!!r.path);
            });
        });
}

async function loadRepoDetails(repo: Repo) {
    const response: HttpResponse = await http({
        method: "GET",
        url: `https://api.github.com/repos/${username}/${repo.name}/contents/repo.explorer.json`,
        headers: headers,
    });

    if(response.statusCode == 200) {
        const fileDetails = JSON.parse(response.body);
        const content = btoa(fileDetails.content);
        const metadata: RepoMetadata = JSON.parse(content);
        Object.assign(repo, metadata);
    }
}
