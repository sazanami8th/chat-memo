window.addEventListener("load", function(){
    let timeLine = new TimeLine();
    let timeLineController = new TimeLineController(timeLine);
});

class Post{
    constructor(timeStamp, userName, message){
        this.id = "post_" + Math.random().toString(36).slice(-8);
        this.timeStamp = timeStamp;
        this.userName = userName;
        this.message = message;
    }

    toString(){
        let str = "[#post]\n";
        str += this.timeStamp.toLocaleString() + "\n";
        str += this.userName + "\n";
        str += this.message + "\n";
        str += "[#end]\n\n";
        return str;
    }
}

class TimeLine{
    constructor(){
        this.posts = [];
    }

    push(newPost){
        if(!(newPost instanceof Post)){
            return;
        }
        this.posts.push(newPost);
    }

    delete(targetPost){
        if(!(targetPost instanceof Post)){
            return;
        }
        this.posts.splice(this.posts.indexOf(targetPost), 1);
    }

    toString(){
        let str = "";
        this.posts.forEach((element) => {
            str += element.toString();
        });
        return str.trim();
    }
}

class TimeLineController{
    constructor(timeLine){
        this.timeLine = timeLine;
        this.timeLineFrame = document.getElementById("time_line_frame");
        this.postFormContainer = document.getElementById("post_form_container");

        this.homeButton = document.getElementById("home_button");
        this.homeButton.addEventListener("click", () => {
            window.scroll({
                top: 0,
                behavior: "smooth",
            });
        });

        this.openButton = document.getElementById("open_button");
        this.openForm = document.getElementById("open_form");
        this.openButton.addEventListener("click", () =>{
            this.openForm.click();
        });
        this.openForm.addEventListener("change", () => {
            let fileList = this.openForm.files;
            if(fileList.length == 0){
                return;
            }
            while (this.timeLineFrame.firstChild) {
                this.timeLineFrame.removeChild(this.timeLineFrame.firstChild);
            }
            this.timeLine.posts = [];
            this.load(fileList[0]);
        });

        this.saveButton = document.getElementById("save_button");
        this.saveButton.addEventListener("click", () => {
            if(this.timeLine.posts.length === 0){
                return;
            }
            let filename = "Log_";
            filename += this.timeLine.posts[0].timeStamp.toLocaleString().replaceAll(/[:/\s]/g, "");
            filename += "-";
            filename += this.timeLine.posts[this.timeLine.posts.length - 1].timeStamp.toLocaleString().replaceAll(/[:/\s]/g, "");
            this.save(filename);
        });

        this.dummyTextArea = this.postFormContainer.querySelector(".dummy_text_area");
        this.postContent = document.getElementById("post_content");
        this.postContent.addEventListener("input", arg => {
            this.dummyTextArea.textContent = arg.target.value + "\u200b";
        });

        this.postSendButton = document.getElementById("post_send_button");
        this.postSendButton.addEventListener("click", () => {
            let postContent = document.getElementById("post_content").value;
            if(postContent == ""){
                return;
            }
            this.push(new Post(new Date(), "user", postContent));
            this.postContent.value = "";
            this.dummyTextArea.textContent = "";
        });
    }

    push(newPost){
        if(!(newPost instanceof Post)){
            return;
        }

        let newPostContainer = document.createElement("div");
        newPostContainer.id = newPost.id;
        newPostContainer.className = "post";
        
        let userOfNewPost = document.createElement("h2");
        userOfNewPost.className = "user_name";
        userOfNewPost.textContent = newPost.userName;

        let timeStampOfNewPost = document.createElement("span");
        timeStampOfNewPost.className = "time_stamp";
        timeStampOfNewPost.textContent = newPost.timeStamp.toLocaleString();

        let messageOfNewPost = document.createElement("p");
        messageOfNewPost.className = "message";
        messageOfNewPost.textContent = newPost.message;

        newPostContainer.appendChild(userOfNewPost);
        newPostContainer.appendChild(timeStampOfNewPost);
        newPostContainer.appendChild(messageOfNewPost);
        this.timeLineFrame.insertBefore(newPostContainer, this.timeLineFrame.firstChild);

        this.timeLine.push(newPost)
    }

    save(filename){
        let blob = new Blob([this.timeLine.toString()], {type: "text/plain"});
        let aTag = document.createElement("a");
        aTag.href = URL.createObjectURL(blob);
        aTag.target = "_blank";
        aTag.download = filename;
        aTag.click();
        URL.revokeObjectURL(aTag.href);
    }

    load(filename){
        // ファイルの読込
        let reader = new FileReader();
        reader.readAsText(filename);

        reader.onload = () => {
            const postRegex = /\[#post\][\s\S]+?\[#end\]/g;
            let matchedPosts = reader.result.match(postRegex);
            matchedPosts.forEach((element) => {
                element = element.replaceAll(/\[#post\]|\[#end\]/g, "").trim();
                const contentRegex = /(?<timeStamp>.+?)\n(?<userName>.+?)\n(?<message>[\s\S]+)/
                let matchedContents = element.match(contentRegex);
                this.push(new Post(new Date(matchedContents.groups.timeStamp), matchedContents.groups.userName, matchedContents.groups.message));
            });
        };
    }
}