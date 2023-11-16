// On load event, get a list of repos from Github
//
$(document).ready(function () {
    getRepos();
});

// Initialize the search index
var lunrIndex = lunr(function () {
    this.field('title', {boost: 10});
    this.field('description');
    this.field('language');
    this.ref('id');
});

function getRepos() {
    $.getJSON("js/github_repos.json", function(repos_json) {

        for (var repo in repos_json) {
            // Add repos to the index
            lunrIndex.add({
                id: repos_json[repo].id,
                title: repos_json[repo].name,
                description: repos_json[repo].description,
                language: repos_json[repo].language
            });
        }

		displayRepos(repos_json);
        // Once the index is ready
        addKeyupListenerForSearch();
    });
}

function addKeyupListenerForSearch() {
    $('#custom-search').keyup(function() {
        searchRepos($('#custom-search').val());
    });
}

function displayRepos(repos) {
    var directive = {
        '.thumbnail-container': {
            'repo<-': {
                '.thumbnail@id': 'repo.id',
                '.repo-title': 'repo.name',
                '.repo-title@href': 'repo.html_url',
                '.repo-description': 'repo.description',
                '.repo-stars': 'repo.stargazers_count',
                '.repo-forks': 'repo.forks_count',
                '.repo-language': 'repo.language'
            }
        }
    };

    $p('.repo-list').render(repos, directive);
	$('.repo-list').show();
}

function searchRepos(query) {
    var result = lunrIndex.search(query);

    // For a blank query or a single character query, reset the view and display all repos
    if (query.length < 2) {
        $('.thumbnail-container').show();
        return;
    }

    // Otherwise, hide all elements, then display results
    $('.thumbnail-container').hide();

    if (result.length !== 0) {
        for (var i = 0; i < result.length; i++) {
            $('#' + result[i].ref).parent().show();
        }
    }
}
