"use strict";f
import {createNode, getData, postData} from "./util.mjs";

const checkLogin = new Event('checkLogin');

var loginRetry = (message) => {
    var root = createLoginPrompt();
    var messageElement = document.createElement('h3');
    messageElement.innerHTML = message;
    messageElement.setAttribute('class', 'login-prompt');
    root.prepend(messageElement);
    return root;
};

var handleCheckLogin = async (event) => {
    fetch('/device-code/', {
        method: 'GET',
        redirect: 'follow'
    }).then( (response) => {
        var message;
        switch(response.status) {
            case 401: // User supplied invalid credientials
                message = "Your credentials were invalid.  Please try again.";
                loginRetry(message);
                break;

            case 403:  // User unallowed to access client
                message = "The credentials you provided do not have sufficient provileges to access the the workspace agent.  Please try again with different credentials or upgrade your account.";
                loginRetry(message);
                break;
                
            case 419:  // User loging timeout
                message = "The login attempt timed out while you were trying to login.  Please try again.";
                loginRetry(message);
                break;

            case 100: // Waiting for user login
                var timeout = 5000;
                console.log("Waiting for user input.  Repolling in " + timeout + " msecs");
                fireCheckLogin(timeout);
                break;
        }
    });
}

var fireCheckLogin = (timeout) => {
    if (!timeout) {
        timeout = 5000; // defualt to 5 seconds
    }
    setTimeout(() => {
        var root = getRoot();
        root.dispatchEvent('checkLogin');
    }, timeout)
}


var getRoot = () => {
    return document.querySelector("#root");
}

var displayDeviceCode = async (deviceData) => {
    var root = getRoot();

    root.innerHTML = '';

    var message = "Click the button .  Your login confirmation code is " + deviceData.device_code + ".   Please click the button below to redirect to the login page."

    createNode(root, "h3", "login-prompt", message);

    var btn = createNode(root, "a", "btn btn-success", "Log In");

    btn.setAttribute("href", deviceData.url);
    btn.setAttribute("role", "button");

    root.addEventListener('checkLogin', handleCheckLogin);

    fireCheckLogin();
}

var getDeviceCode = () => {
    postData("/device-code/").then((deviceCode) => displayDeviceCode(deviceCode));
}

var createLoginPrompt = () => {
    var root = getRoot();

    root.innerHTML = '';

    createNode(root, "h3", "login-prompt", "Please Log into Presalytics to Get Started");
    var btn = createNode(root, "button", "btn btn-secondary", "Log In");

    btn.addEventListener("click", getDeviceCode);

    return root;
}

var initLogin = () => {
    createLoginPrompt();
}

document.addEventListener("DOMContentLoaded", initLogin);
