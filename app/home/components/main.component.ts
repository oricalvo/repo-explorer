import {Component} from '@angular/core';
import {Repo, RepoService} from "../../services/repo.service";
import {Router} from "@angular/router";
import {RootService} from "../../services/root.service";

@Component({
  selector: "my-home-main",
  moduleId: module.id,
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.css"]
})
export class MainComponent {
  constructor(private repoService: RepoService, private rootService: RootService, private router: Router) {
  }

  get state() {
    return this.repoService.state;
  }

  ngOnInit() {
    this.repoService.loadAll();
  }

  select(repo: Repo) {
    this.router.navigate(["/repo/", repo.name]);

    //this.rootService.gotoRepoDetails(repo);
  }
}
