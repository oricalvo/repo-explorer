import {ServiceStore, Activity} from "t-rex";
import {Http, Headers, Response} from "@angular/http";
import "rxjs/add/operator/toPromise";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {transaction} from "t-rex/decorators";

export interface Repo {
    name: string;
}

export interface RepoMetadata {
    name: string;
    path: string;
}

export interface ReposState {
    all: Repo[];
    current: RepoMetadata;
    loading: boolean;
    error: Error;
}

const PAGE_SIZE = 100;
const username = "oricalvo";
const password = "hello05";

@Injectable()
export class RepoService {
    headers: Headers;

    store = ServiceStore.create<ReposState>("repos", {
        all: null,
        loading: false,
        error: null,
        current: null,
    });

    constructor(private http: Http) {
        this.headers = new Headers();
        this.headers.append("Authorization", "Basic " + btoa(username + ":" + password));
    }

    get state() {
        return this.store.getState();
    }

    private getReposPage(index): Observable<Response> {
        console.log("getReposPage", index);

        const response = this.http.get(`https://api.github.com/user/repos?page=${index}&per_page=${PAGE_SIZE}`, {
            headers: this.headers,
        });

        return response;
    }

    private deleteRepo(repoName: string): Observable<Response> {
        return this.http.delete(`https://api.github.com/repos/${username}/${repoName}`, {
            headers: this.headers,
        });
    }

    private getLastPageFromResponse(response) {
        let index = -1;

        const link = response.headers.get("link");
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

    @Activity({beginTransaction: false})
    async loadAll() {
        if(this.state.all) {
            return;
        }

        transaction(this.store.getAppStore(), ()=> {
            this.store.update({
                loading: true
            });
        });

        transaction(this.store.getAppStore(), async ()=> {
            try {
                const repos: Repo[] = await this.getAll().toArray().toPromise();

                this.store.update({
                    all: repos,
                    loading: false,
                });
            }
            catch(err) {
                this.store.update({
                    error: err,
                });
            }
        });
    }

    @Activity()
    async loadDetails(repoName: string): Promise<RepoMetadata> {
        if(this.state.current && this.state.current.name == repoName) {
            return this.state.current;
        }

        const repo = this.getRepoByName(repoName);

        const response = await this.http.get(`https://api.github.com/repos/${username}/${repo.name}/contents/repo.explorer.json`, {
            headers: this.headers,
        }).map(r=>r.json()).toPromise();

        const metadata: RepoMetadata = JSON.parse(atob(response.content));

        this.store.update({
            current: metadata,
        });

        console.log(metadata);
    }

    private getAll(): Observable<Repo> {
        const pages = Observable.create(observer => {
            const first = this.getReposPage(1);

            first.subscribe(
                response => {
                    const lastPage = this.getLastPageFromResponse(response);

                    observer.next(Observable.of(response.json()));

                    for (let i = 2; i <= lastPage; i++) {
                        observer.next(this.getReposPage(i).map(r => r.json()));
                    }

                    observer.complete();
                },
                err => {
                    if (err) {
                        observer.error(err);
                    }
                });
        });

        return pages.flatMap(s => s).flatMap(s => s);
    }

    getRepoByName(name: string) {
        if(!this.state.all) {
            throw new Error("Repos were not loaded yet");
        }

        const repo = this.state.all.find(r => r.name == name);
        if(!repo) {
            throw new Error("Repo with name: " + name + " was not found");
        }

        return repo;
    }
}
