chrome.runtime.onMessage.addListener(
  function (message, sender, response) {
    console.log("Request received");
    var chapters = document.getElementsByClassName("j_contentWrap")[0].children;
    console.log(chapters);

    var unlockedChapters = [];

    for(var i = 0; i < chapters.length; i++){
      if(!locked(chapters[i])){
        unlockedChapters.push(chapters[i]);
      }
    }

    console.log(unlockedChapters);

    if(message.type == "getChapterCount"){
      response(unlockedChapters.length);
    }
    else if(message.type == "getChapterNumbers"){
      var chapterNumbers = new Array(chapters.length);
      for (var i = 0; i < unlockedChapters.length; i++) {
        var title = unlockedChapters[i].getElementsByClassName("cha-tit")[0].innerText;
        chapterNumbers[i] = title.substring(8, title.indexOf(":"));
      }
      response(chapterNumbers);
    }
    else if(message.type == "getChapterContent"){
        var content = '';

        var i = 0;
        for(var i = 0; i < message.chapters.length; i++){
          var title = unlockedChapters[parseInt(message.chapters[i])].getElementsByClassName("cha-tit")[0].children;
          var words = unlockedChapters[parseInt(message.chapters[i])].getElementsByClassName("cha-content")[0].children[0].children;
          
          while(words[0].className == "cha-words"){
            words = words[0].children;
          }

          content += htmlToMarkup(title);
          content += htmlToMarkup(words);
          content += "\n\n\n";
        }
        response(content);
    }
    else{
      console.error("Unrecognised message: ", message);
    }
  }
)

function locked(chapter){
  for(var i = 0; i < chapter.children.length; i++){
    if(chapter.children[i].className == "cha-content _lock"){
      return true;
    }
  }
  return false;
}

function htmlToMarkup(htmlElements){
  var markup = '';
  for(var i = 0; i < htmlElements.length; i++){
    if(htmlElements[i].childNodes.length == 1){
      markup += nodeToMarkup(htmlElements[i]) + "\n\n";
    }else if (htmlElements[i].childNodes[0] != undefined){
      for(var j = 0; j < htmlElements[i].childNodes.length; j++){
        markup += nodeToMarkup(htmlElements[i].childNodes[j]);
        markup += " ";
      }
      markup += "\n\n";
    }
  }
  return markup;
}

function nodeToMarkup(elementNode){
  switch(elementNode.nodeName){
    case "#text":
      return elementNode.textContent.trim();
    case "ANNO":
      return elementNode.childNodes[0].textContent.trim() +
      " [" + elementNode.childNodes[1].textContent.trim() + "]";
    case "STRONG":
      return "**" + elementNode.textContent.trim() + "**";
    case "EM":
      return "*" + elementNode.textContent.trim() + "*";
    case "H3":
      return "###" + elementNode.textContent;
    case "OL":
      var annotations = "";
      for(var i = 1; i < elementNode.childNodes.length; i+=2){
        annotations +=  (1 + i)/2 + ". " + elementNode.childNodes[i].textContent.trim() + "\n\n";
      }
      return annotations;
    default:
      return elementNode.textContent.trim();
  }
}