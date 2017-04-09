import {AppStore, ServiceStore} from "t-rex";
import {ProductService, ProductsState} from "./product.service";
import {Injectable} from "@angular/core";
import {Repo} from "./repo.service";
import {Router} from "@angular/router";

export interface AppState {
    products: ProductsState;
}

@Injectable()
export class RootService {
    store = ServiceStore.create<AppState>("/", {
        products: null,
    });

    constructor() {
    }

    // gotoRepoDetails(repo: Repo) {
    //     this.router.navigate(["/repo/", repo.name]);
    // }
}
