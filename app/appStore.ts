import {AppState, RootService} from "./services/root.service";
import {ProductService} from "./services/product.service";
import {AppStore} from "t-rex";
import {RepoService} from "./services/repo.service";

export function initAppStore(   rootService: RootService,
                                productService: ProductService,
                                repoService: RepoService) {
    const appStore = new AppStore<AppState>();

    appStore.init([
        rootService,
        productService,
        repoService,
    ]);
}
