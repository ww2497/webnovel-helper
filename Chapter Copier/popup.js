chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.executeScript(tabs[0].id, {file: 'content.js'});
  console.log("Content injected");
});

function copyToClipboard(text){
  var copy = function (e) {
    e.preventDefault();
    if (e.clipboardData) {
      console.log("Text copied");
      e.clipboardData.setData('text/plain', text);
    }else if (window.clipboardData) {
      console.log("Text copied");
      window.clipboardData.setData('Text', text);
    }else{
      console.log("Error");
    }
  }
  window.addEventListener("copy", copy);
  document.execCommand("copy");
  window.removeEventListener("copy", copy);
}
var unlockedChapters;

function constructOptions(length) {
  unlockedChapters = length;
  buttonDiv.innerHTML = '<button id="update">Update</button> <div id = "chapterDiv"></div>';
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: "getChapterNumbers"}, function(numbers){
      for (var i = 0; i < length; i++) (function(i){
        let button = document.createElement('input');
        button.type = "checkbox";
        chapterDiv.appendChild(button);
        chapterDiv.innerHTML += numbers[i];
        chapterDiv.innerHTML += "<br>";
      })(i);
    })
  })
  buttonDiv.innerHTML += '<button id = "copy">Copy</button>';
  copy.onclick = function(){
    var chaptersWantedIndex = [];
  
    for(var i = 0; i < chapterDiv.childNodes.length; i+=3){
      if(chapterDiv.childNodes[i].checked){
        chaptersWantedIndex.push(i/3);
      }
    }
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "getChapterContent", chapters: chaptersWantedIndex}, copyToClipboard)
    })
  }
}

update.onclick = function(){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: "getChapterCount"}, constructOptions)
    console.log("Information received")
  });
}

// copy.onclick = function(){
//   var url = "https://paste.imirhil.fr";
//   var key = sjcl.codec.base64.fromBits(sjcl.random.randomWords(8, 0), 0);
//   var doc = sjcl.encrypt(key, "test content", {mode : 'gcm'});
//   var req = new XMLHttpRequest();
//   var formData = new FormData();

//   formData.append("data", doc);
//   formData.append("expire", "never");
//   formData.append("formatter", "markdown");
//   formData.append("burnafterreading", 0);
//   formData.append("opendiscussion", 0);
  
//   req.open('POST', url);
//   req.setRequestHeader("X-Requested-With", "JSONHttpRequest");
//   //req.setRequestHeader("User-Agent", navigator.userAgent);
//   req.send(formData);
  
//   req.onreadystatechange = processRequest;
//   function processRequest(e) {
//     if (req.readyState == 4 && req.status == 200) {
//       var jsonResponse = JSON.parse(req.responseText);
//       console.log(jsonResponse["url"]);
//       console.log(key);
//       console.log(url + jsonResponse["url"] + "#" + key);
//     }
//   }
// }