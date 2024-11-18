/* Update the repositories listed on the homepage.
 *
 * This script gets repositories in the tableau organization from the GitHub API
 * and filters the response down to a subset of fields.
 * Note: We can't load the API response directly because we hit API rate limits.
 */
const fs = require("fs");
const https = require("https");

const repoFile = "js/github_repos.json";
const requestOpts = {
  hostname: "api.github.com",
  path: "/orgs/tableau/repos?per_page=100&sort=full_name&type=public",
  headers: {
    "User-Agent": "request"
  }
};

function filterJson(reposJson) {
  let repos = [];
  const fieldsToKeep = [
    "name",
    "html_url",
    "id",
    "description",
    "stargazers_count",
    "forks_count",
    "language"
  ];

  JSON.parse(reposJson).forEach(function(repo) {
    let repoJsonSubset = {};

    if (repo["archived"] == false) {
      for (var field in repo) {
          if (fieldsToKeep.indexOf(field) !== -1) {
          repoJsonSubset[field] = repo[field];
        }
      }
      repos.push(repoJsonSubset);
    }
  });

  repos.sort(function (a, b) {
    return b.stargazers_count - a.stargazers_count;
  });

  return repos;
}

function writeJsonToFile(outStr, outFile) {
  let formattedJsonStr = JSON.stringify(outStr, null, 2);

  fs.writeFile(outFile, formattedJsonStr, function(err) {
    if (err) {
      return console.log("Error: " + err);
    }
  });
}

const req = https
  .get(requestOpts, resp => {
    let fullResponseJson = "";

    resp.on("data", d => {
      fullResponseJson += d;
    });
    resp.on("end", () => {
      writeJsonToFile(filterJson(fullResponseJson), repoFile);
    });
  })
  .on("error", err => {
    console.log("Error: " + err.message);
  });

req.end();
