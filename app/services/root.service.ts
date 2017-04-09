import {AppStore, ServiceStore} from "t-rex";
import {ProductService, ProductsState} from "./product.service";
import {Injectable} from "@angular/core";

export interface AppState {
    products: ProductsState;
}

@Injectable()
export class RootService {
    store = ServiceStore.create<AppState>("/", {
        products: null,
    });
}
