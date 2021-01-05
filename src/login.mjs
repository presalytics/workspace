"use strict";
import {createNode, getData} from "./util.mjs";


var getRoot = () => {
    return document.querySelector("#root");
}

var createLoginPrompt = () => {
    var root = getRoot();

    createNode(root, "h3", "login-prompt", "Please Log into Presalytics to Get Started");
    var btn = createNode(root, "button", "btn btn-secondary", "Log In");

    btn.addEventListener("click", (event) => {
        
    });

}

var initLogin = () => {
    createLoginPrompt();
}

document.addEventListener("DOMContentLoaded", initLogin);
