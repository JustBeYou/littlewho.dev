'use strict';

const asideExpandedWidth  = "400px";
const asideCollapsedWidth = "0px";
const asideSelector = "div.main-layout aside";
let asideMenuState = "collapsed"; // collapsed, expanded or top

function resizeAside(size) {
    const asideElement = document.querySelector(asideSelector);
    asideElement.style.width = size;
}

function switchAsideState() {
    if (asideMenuState === "collapsed") {
        resizeAside(asideExpandedWidth);
        asideMenuState = "expanded";
    } else {
        resizeAside(asideCollapsedWidth);
        asideMenuState = "collapsed";
    } 
}

function handleAsideResize() {
    switchAsideState();
}

function createUserRow({_id, name, email, admin}, userRowTemplate) {
    const newRow = userRowTemplate.content.cloneNode(true);
    const tr = newRow.querySelector("tr");
    tr.id = _id;
    const tds = newRow.querySelectorAll("td");
    tds[0].textContent = _id;
    tds[1].textContent = name;
    tds[2].textContent = email;
    tds[3].textContent = admin ? "Yes" : "No";

    const actionsTd = tds[4];
    const deleteButton = actionsTd.querySelector('.user-delete');
    const makeAdminButton = actionsTd.querySelector('.user-rights');

    deleteButton.addEventListener('click', async () => {
        await fetch(`/user/${_id}`, {
            method: 'DELETE',
        });
        document.getElementById(_id).remove();
    });

    const removeAdminHandler = async () => {
        await fetch(`/user/${_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({admin: false}),
        });

        makeAdminButton.onclick = makeAdminHandler;
        makeAdminButton.textContent = "Make admin";
        tds[3].textContent = "No";
    };
    const makeAdminHandler = async () => {
        await fetch(`/user/${_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({admin: true}),
        });

        makeAdminButton.onclick = removeAdminHandler;
        makeAdminButton.textContent = "Remove admin";
        tds[3].textContent = "Yes";
    };

    if (admin) {
        makeAdminButton.textContent = "Remove admin";
        makeAdminButton.onclick = removeAdminHandler;
    } else {
        makeAdminButton.onclick = makeAdminHandler;
    }

    return newRow;
}

async function createNewUser() {
    const name = document.getElementById('input-user-name').value;
    const email = document.getElementById('input-user-email').value;
    const radios = document.getElementsByName('is-admin');
    let admin = undefined;

    for (const radio of radios) {
        if (radio.checked) {
            if (radio.value === '1') {
                admin = true;
            } else {
                admin = false;
            }
        }
    }

    if (name === '' || email === '' || admin === undefined) {
        const row = document.getElementById('input-user');
        row.style.backgroundColor = '#ff9999';
        return ;
    }

    const resp = await fetch('/user', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({name, email, admin, password: 'default'}),
    });
    const userResp = await resp.json();

    const userRowTemplate = document.getElementById("user-row");
    const usersTableContent = document.getElementById("users-table-content");

    const userRow = createUserRow(userResp.user, userRowTemplate);
    usersTableContent.insertBefore(userRow, usersTableContent.firstChild);
}

async function addUsersToTable() {
    const usersTableContent = document.getElementById("users-table-content");
    if (usersTableContent === null) return ;

    const resp = await fetch('/user', {
        method: 'GET',
    });
    const usersResp = await resp.json();

    const userRowTemplate = document.getElementById("user-row");
    for (const userData of usersResp.users) {
        const newRow = createUserRow(userData, userRowTemplate);
        usersTableContent.appendChild(newRow);
    }

    const createUserRowTemplate = document.getElementById("create-user-row");
    const newRow = createUserRowTemplate.content.cloneNode(true);
    usersTableContent.appendChild(newRow);
}

function onloadHandler() {
    const activator = document.querySelector(".activate-aside");
    activator.addEventListener('click', handleAsideResize);

    addUsersToTable();
}

window.onload = onloadHandler;
window.addEventListener('scroll', () => {
    resizeAside(asideCollapsedWidth);
    asideMenuState = "collapsed";
});