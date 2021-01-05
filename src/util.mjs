
const db = new Map();

var getStoryHost = async () => {
    var storyHost = db.get('storyHost');
    try {
        if (!storyHost) {

            storyHost = await fetch('/story/environment/').then( (response) => {
                return response.json().then( (data) => {
                    return storyHost = data.browserApiHost.story;
                });
            });
            db.set('storyHost', storyHost);
        }
    } catch (err){
        console.error(err);
    }
    if (!storyHost) {
        storyHost = "https://api.presalytics.io/story";
    }
    return storyHost;    
}

var isMobile = () => {
    if(window.innerWidth <= 850 && window.innerHeight <= 850) {
      return true;
    } else {
      return false;
    }
 }

var getData = async (url, headers = {}) => {
    if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    var response = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'include', // , *same-origin, omit
        headers: headers,
        redirect: 'manual', // manual, *follow, erro
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });
    if (response.status == 204) {
        return "success"
    } else if (response.ok) {
        return await response.json(); // parses JSON response into native JavaScript objects
    } else {
        try {
            var errMsg = await response.json();
            var detail = errMsg.detail;
            throw new Error(detail);
        } catch (err) {
            throw new Error(response.statusText);
        }
    }
}

var deleteData = async (url, headers = {}) => {
    if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    var response = await fetch(url, {
        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'include', // , *same-origin, omit
        headers: headers,
        redirect: 'manual', // manual, *follow, erro
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });
    if (response.status == 204) {
        setTimeout( () => {
            var refreshEvent = new Event('refreshStory');
            window.dispatchEvent(refreshEvent);
        }, 5000);
        return "success"
    } else if (response.ok) {
        return await response.json(); // parses JSON response into native JavaScript objects
    } else {
        try {
            var errMsg = await response.json();
            var detail = errMsg.detail;
            throw new Error(detail);
        } catch (err) {
            throw new Error(response.statusText);
        }
    }
}

var postData =  async (url = '', data = {}, headers = {}) => {
    // Default options are marked with *
    if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    var response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'include', // , *same-origin, omit
        headers: headers,
        redirect: 'manual', // manual, *follow, erro
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    if (response.ok) {
        setTimeout( () => {
            var refreshEvent = new Event('refreshStory');
            window.dispatchEvent(refreshEvent);
        }, 5000);
    }
    if (response.status == 204) {
        return "success"
    } else if (response.ok) {
        return await response.json(); // parses JSON response into native JavaScript objects
    } else {
        try {
            var errMsg = await response.json();
            var detail = errMsg.detail;
            throw new Error(detail);
        } catch (err) {
            throw new Error(response.statusText);
        }
    }
}

var putData =  async (url = '', data = {}, headers = {}) => {
    // Default options are marked with *
    if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    var response = await fetch(url, {
        method: 'PUT', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'include', // , *same-origin, omit
        headers: headers,
        redirect: 'manual', // manual, *follow, erro
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    if (response.ok) {
        setTimeout( () => {
            var refreshEvent = new Event('refreshStory');
            window.dispatchEvent(refreshEvent);
        }, 5000);
    }
    if (response.status == 204) {
        return "success"
    } else if (response.ok) {
        return await response.json(); // parses JSON response into native JavaScript objects
    } else {
        try {
            var errMsg = await response.json();
            var detail = errMsg.detail;
            throw new Error(detail);
        } catch (err) {
            throw new Error(response.statusText);
        }
    }
}

const debounce = (func, wait) => {
    let timeout;
  
    // This is the function that is returned and will be executed many times
    // We spread (...args) to capture any number of parameters we want to pass
    return function executedFunction(...args) {
  
      // The callback function to be executed after 
      // the debounce time has elapsed
      const later = () => {
        // null timeout to indicate the debounce ended
        timeout = null;
        
        // Execute the callback
        func(...args);
      };
      // This will reset the waiting every function execution.
      // This is the step that prevents the function from
      // being executed because it will never reach the 
      // inside of the previous setTimeout  
      clearTimeout(timeout);
      
      // Restart the debounce waiting period.
      // setTimeout returns a truthy value (it differs in web vs Node)
      timeout = setTimeout(later, wait);
    };
  };

var createNode = function(container, tagname, classname, innerHTML) {
    var node = document.createElement(tagname);
    if (classname) {
        if (Array.isArray(classname)) {
        classname.forEach(function(c) {
            node.classList.add(c);
        });
        } else {
        node.classList.add(classname);
        }
    }
    if (typeof innerHTML === 'string') {
        node.innerHTML = innerHTML;
    }
    container.appendChild(node);

    return node;
}

 
export {
    getStoryHost, isMobile, db, getData, postData, deleteData, putData, debounce, createNode
};