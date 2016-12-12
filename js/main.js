// On load event, get a list of repos from Github
//
$(document).ready(function () {
    getRepos();
});

// Initialize the search index
var lunrIndex = lunr(function () {
    this.field('title', {boost: 10});
    this.field('description');
    this.ref('id');
});

function getRepos() {
    $.getJSON("https://api.github.com/users/tableau/repos", function(repos_json) {
        var repos = [];


        for (var repo in repos_json) {
            // Add repos to an array for sorting
            repos.push({
                id: repos_json[repo].id,
                title: repos_json[repo].name,
                url: repos_json[repo].html_url,
                description: repos_json[repo].description,
                stars: repos_json[repo].stargazers_count,
                forks: repos_json[repo].forks_count
            });

            // Add repos to the index
            lunrIndex.add({
                id: repos_json[repo].id,
                title: repos_json[repo].name,
                description: repos_json[repo].description
            });
        }

		sortRepos(repos);
        // Once the index is ready
        addKeyupListenerForSearch();
    });
}

// Sort by number of stars
function sortRepos(repos) {
	repos.sort(function (a, b) {
        return b.stars - a.stars;
    });

	displayRepos(repos);
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
                '.repo-title': 'repo.title',
                '.repo-title@href': 'repo.url',
                '.repo-description': 'repo.description',
                '.repo-stars': 'repo.stars',
                '.repo-forks': 'repo.forks'

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
