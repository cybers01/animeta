import $ from 'jquery';

// Login Session

export function logout() {
    return $.ajax({type: 'DELETE', url: '/api/v2/auth'});
}

// Account

export function changePassword(oldPassword, newPassword1, newPassword2) {
    return $.post('/api/v2/me/password', {
        old_password: oldPassword,
        new_password1: newPassword1,
        new_password2: newPassword2,
    });
}

// External Services

export function disconnectTwitter() {
    return $.ajax({type: 'DELETE', url: '/api/v2/me/external-services/twitter'});
}

// User Records

export function createRecord(userName, {title, statusType, categoryID}) {
    return $.post(`/api/v2/users/${userName}/records`, {
        work_title: title,
        status_type: statusType,
        category_id: categoryID,
    });
}

// Record

export function updateRecordTitle(recordID, title) {
    return $.post(`/api/v2/records/${recordID}`, {title: title});
}

export function updateRecordCategoryID(recordID, categoryID) {
    return $.post(`/api/v2/records/${recordID}`, {category_id: categoryID});
}

export function deleteRecord(recordID) {
    return $.ajax({type: 'DELETE', url: `/api/v2/records/${recordID}`});
}

// Record Posts

export function getRecordPosts(recordID) {
    return $.get(`/api/v2/records/${recordID}/posts`);
}

export function createPost(recordID, {status, statusType, comment, containsSpoiler, publishTwitter}) {
    return $.post(`/api/v2/records/${recordID}/posts`, {
        status,
        status_type: statusType,
        comment,
        contains_spoiler: containsSpoiler,
        publish_twitter: publishTwitter ? 'on' : 'off',
    });
}

// Post

export function deletePost(postID) {
    return $.ajax({type: 'DELETE', url: `/api/v2/posts/${postID}`});
}

// User Posts

export function getUserPosts(userName, count, beforeID) {
    return $.get(`/api/v2/users/${userName}/posts`, {
        count,
        before_id: beforeID,
    });
}

// Category

export function renameCategory(categoryID, categoryName) {
    return $.post(`/api/v2/categories/${categoryID}`, {name: categoryName});
}

export function removeCategory(categoryID) {
    return $.ajax({type: 'DELETE', url: `/api/v2/categories/${categoryID}`});
}

// User Categories

export function addCategory(userName, categoryName) {
    return $.post(`/api/v2/users/${userName}/categories`, {name: categoryName});
}

export function updateCategoryOrder(userName, categoryIDs) {
    return $.ajax({
        type: 'PUT',
        url: `/api/v2/users/${userName}/categories`,
        data: {ids: categoryIDs}
    });
}
