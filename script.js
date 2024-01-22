const apiUrl = "https://api.github.com/users/";

let currentPage = 1;
let perPage = 10;
let currentSearch = '';

$(document).ready(() => {
    searchRepos();
});

function searchRepos() {
    const username = $('#search').val();
    currentSearch = username;
    getRepos();
}

async function getRepos() {
    const reposContainer = $('#repos-container');
    const loader = $('#loader');
    const paginationContainer = $('#pagination-container');
    const followersContainer = $('#followers-container');
    const followingContainer = $('#following-container');
    const userLinkContainer = $('#user-link-container');
    const avatarElement = $('#avatar');

    loader.show();
    reposContainer.empty();
    paginationContainer.empty();
    followersContainer.empty();
    followingContainer.empty();
    userLinkContainer.empty();

    try {
        const settings={
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ghx_QNSvTlOPbEaCbMu8md5eF0jI5XKH4KemwP'
            }
        }
        const userResponse = await fetch(`${apiUrl}${currentSearch}`);
        const userData = await userResponse.json();

        console.log('User Data:', userData);

        if (userData.login) {
            followersContainer.text(`Followers: ${userData.followers || 0}`);
            followingContainer.text(`Following: ${userData.following || 0}`);
            userLinkContainer.html(`<a href="${userData.html_url}" target="_blank">GitHub Link</a>`);
            avatarElement.attr('src', userData.avatar_url);
            console.log('avatarElement')
            avatarElement.attr('alt', `${currentSearch}'s Avatar`);
            
            const reposResponse = await fetch(`${apiUrl}${currentSearch}/repos?per_page=${perPage}&page=${currentPage}`);
            const repos = await reposResponse.json();

            loader.hide();

            if (Array.isArray(repos) && repos.length > 0) {
                repos.forEach(repo => {
                    const repoElement = $('<div class="repo"></div>');
                    repoElement.html(
                        `<div class="card text-center">
                        <div class="card-header">
                        ${repo.language || 'Not specified'}
                        </div>
                        <div class="card-body">
                          <h5 class="card-title">${repo.name}</h5>
                          <p class="card-text"> Stars: ${repo.stargazers_count}  Forks:${repo.forks_count}</p>
                          <a href="${repo.clone_url}" target="_blank" class="btn btn-primary">Link</a>

                        </div>
                        <div class="card-footer text-body-secondary">
                        Created at: ${repo.created_at.slice(0, 10)}
                    </div>
                    </div>
                    <br>
                      `
                       
                    );
                    reposContainer.append(repoElement);
                });
            } else {
                reposContainer.html('<p>No repositories found</p>');
            }

            const linkHeader = reposResponse.headers.get('Link');
            const totalPages = getTotalPages(linkHeader);
            displayPagination(totalPages);
        } else {
            loader.hide();
            reposContainer.html('<p style="text-align: center;">User details not available</p>');
        }
    } catch (error) {
        loader.hide();
        console.error('Error fetching repositories:', error);
        reposContainer.html('<p>Error fetching repositories</p>');
    }
}

function getTotalPages(linkHeader) {
    const links = parseLinkHeader(linkHeader);
    const lastPageUrl = links['last'];
    if (lastPageUrl) {
        const lastPageMatch = lastPageUrl.match(/&page=(\d+)$/);
        if (lastPageMatch) {
            return parseInt(lastPageMatch[1]);
        }
    }
    return 1;  
}

function parseLinkHeader(header) {
    if (!header) {
        return {};
    }

    const linkArray = header.split(', ');
    const links = {};

    linkArray.forEach(link => {
        const [url, rel] = link.split('; ');
        const relValue = rel.match(/"([^"]+)"/)[1];
        links[relValue] = url.slice(1, -1);
    });

    return links;
}

function displayPagination(totalPages) {
    const paginationContainer = $('#pagination-container');
    paginationContainer.empty();

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = $(`<button>${i}</button>`);
        pageButton.click(() => {
            currentPage = i;
            getRepos();
        });

        if (i === currentPage) {
            pageButton.addClass('active');
        }

        paginationContainer.append(pageButton);
    }
}
function myFunction() {
    var element = document.body;
    element.classList.toggle("dark-mode");
  }
