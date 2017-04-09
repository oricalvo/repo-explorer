import {Component} from '@angular/core';
import {Repo, RepoService} from "../../services/repo.service";
import {Router, ActivatedRoute} from "@angular/router";
import {RootService} from "../../services/root.service";

@Component({
  selector: "my-repo-details",
  moduleId: module.id,
  templateUrl: "./repoDetails.component.html",
  styleUrls: ["./repoDetails.component.css"]
})
export class RepoDetailsComponent {
  constructor(private repoService: RepoService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.repoService.loadDetails(this.route.snapshot.params["name"])
    //this.repo = this.repoService.getRepoByName(this.route.snapshot.params["name"]);
  }

  get state(): Repo {
    return this.repoService.state.current;
  }
}
