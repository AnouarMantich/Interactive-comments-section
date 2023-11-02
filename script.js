const commentSection = document.querySelector(".comment-section");
const ReplayLink = document.getElementsByClassName("reply-btn");
const sendBTN = document.getElementsByClassName("btn-send");
const sendReply = document.getElementsByClassName("edit-send");
const operators = document.getElementsByClassName("operator");
const updateBTN = document.getElementsByClassName("btn-update");
const confirmDelete = document.querySelector(".confirm");
const cancelDelete = document.querySelector(".cancel");
const background = document.querySelector(".background");
let currentUser;
let comments = JSON.parse(localStorage.getItem("comments"));
let textArea = document.getElementsByTagName("textarea");
let latestCommentId = 0;

let editBTN = document.getElementsByClassName("edit-btn");

let deleteBTN = document.getElementsByClassName("delete-btn");

func = function () {
  comments.forEach((comment) => {
    latestCommentId = comment["id"];
    if (comment["replies"] != []) {
      comment["replies"].forEach((reply) => {
        if (reply != {}) latestCommentId++;
      });
    }
  });
};

const Display = function (func = function () {}) {
  fetch("./data.json")
    .then((response) => response.json())
    .then((json) => {
      currentUser = json["currentUser"];
      commentSection.innerHTML = ``;
      if (!comments) {
        localStorage.setItem("comments", JSON.stringify(json["comments"]));
        comments = JSON.parse(localStorage.getItem("comments"));
      }
      func();
      comments.forEach((comment) => {
        commentSection.insertAdjacentHTML("beforeend", addComment(comment));
        if (comment["replies"] != []) {
          html = `<section class="comment-subsection">`;
          comment["replies"].forEach((reply) => {
            html += addComment(reply);
          });
        }
        html += `</section>`;
        commentSection.insertAdjacentHTML("beforeend", html);
        Reply(comment);
      });
      html = `
              <div class="create-comment">
              <div class="user-info">
                <div class="avatar"></div>
                <img src="${currentUser["image"]["png"]}" alt="" srcset="" />
              </div>
              <form>
                <textarea class="form-control " rows="3" placeholder="Add a new comment" ></textarea>
                <button class="btn btn-primary btn-send">Send</button>
              </form>
             </div>
      `;
      commentSection.insertAdjacentHTML("beforeend", html);
      updateReply(editBTN);
      sendComment(sendBTN[0]);
      deleteComment(deleteBTN);
      alterScore();
    });
};

Display(func);

const Reply = function (com) {
  for (let element of ReplayLink) {
    element.addEventListener("click", function (e) {
      e.preventDefault();
      let comment = element.closest(".comment");

      if (
        comment.nextElementSibling === null ||
        !comment.nextElementSibling.classList.contains("reply-comment")
      ) {
        html = `
                  <div class="reply-comment">
                  <div class="user-info">
                    <div class="avatar"></div>
                    <img src="${currentUser["image"]["png"]}" alt="" srcset="" />
                  </div>
                  <form>
                    <textarea class="form-control" rows="3"  ></textarea>
                    <button class="btn btn-primary edit-send">Reply</button>
                  </form>
                </div>
                  `;
        const editCommentToRemove = document.querySelector(".reply-comment");
        if (editCommentToRemove) {
          editCommentToRemove.remove();
        }
        element.closest(".comment").insertAdjacentHTML("afterend", html);
        sendReplyFunction(com);
      }
    });
  }
};

const addComment = function (comment) {
  html = `

              <div class="comment">
                <div class="level">
                  <div class="plus operator" data-oper=+ data-id=${
                    comment["id"]
                  }><i class="fa-solid fa-plus"></i></div>
                   <div class="count">${comment["score"]}</div>
                  <div class="minus operator" data-oper=- data-id=${
                    comment["id"]
                  }><i class="fa-solid fa-minus"></i></div>
                </div>
                <div class="comment-info">
                  <div class="user-info">
                    <div class="avatar">
                      <img
                        src="${comment["user"]["image"]["png"]}"
                        alt=""
                        srcset=""
                      />
                    </div>
                    <div class="name">${comment["user"]["username"]}</div>
                    <h5 class="${
                      currentUser["username"] != comment["user"]["username"]
                        ? "hidden"
                        : ""
                    }" ><span class="badge">you</span></h5>
                    <div class="date-of-post">${comment["createdAt"]}</div>
                  </div>
                  <div class="comment-content">
                   <span class="replayTo"> ${
                     comment["replyingTo"] ? "@" + comment["replyingTo"] : ""
                   } </span> ${comment["content"]}
                  </div>
                </div>
                <div class="btn-action">
                        <div class="delete-btn ${
                          currentUser["username"] != comment["user"]["username"]
                            ? "hidden"
                            : ""
                        } ">
                          <a href="#"  data-number=${
                            comment["id"]
                          }><i class="fa-solid fa-trash"></i>delete</a>
                        </div>
                        <div class="edit-btn ${
                          currentUser["username"] != comment["user"]["username"]
                            ? "hidden"
                            : ""
                        }"  data-number=${comment["id"]}>
                          <a href="#"><i class="fa-solid fa-pen"></i>edit</a>
                        </div>
                        <div class="reply-btn ${
                          currentUser["username"] ===
                          comment["user"]["username"]
                            ? "hidden"
                            : ""
                        } ">
                          <a href="#"><i class="fa-solid fa-reply "></i> Reply</a>
                        </div>
                      </div>
              </div>

              `;
  return html;
};

/////////////////////////////////////// send  a new comment /////////////////////////////////

const sendComment = function (btn) {
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    commentContent = textArea[textArea.length - 1].value;
    latestCommentId++;

    date = new Date();

    commentInfos = {
      id: latestCommentId,
      content: commentContent,
      createdAt:
        date.getDate() +
        "/" +
        (Number(date.getMonth()) + 1) +
        "/" +
        date.getFullYear(),
      score: 0,
      user: {
        image: {
          png: currentUser["image"]["png"],
          webp: currentUser["image"]["webp"],
        },
        username: currentUser["username"],
      },
      replies: [],
    };

    comments.push(commentInfos);
    localStorage.setItem("comments", JSON.stringify(comments));
    Display();
  });
};

/////////////////////////////////////// send a new reply  /////////////////////////////////

const sendReplyFunction = function (comment) {
  let commentReply;
  textArea[0].value = `@${comment["user"]["username"]}, `;
  sendReply[0].addEventListener("click", function (e) {
    e.preventDefault();
    latestCommentId += 1;
    let content = textArea[0].value.split(",");
    date = new Date();

    content.shift();
    content = content.join(" ");
    commentReply = {
      id: latestCommentId,
      content: content,
      createdAt:
        date.getDate() +
        "/" +
        (Number(date.getMonth()) + 1) +
        "/" +
        date.getFullYear(),
      score: 0,
      replyingTo: comment["user"]["username"],
      user: {
        image: {
          png: currentUser["image"]["png"],
          webp: currentUser["image"]["webp"],
        },
        username: currentUser["username"],
      },
    };
    comments.forEach((element) => {
      if (element === comment) {
        element["replies"].push(commentReply);
        localStorage.setItem("comments", JSON.stringify(comments));
        Display();
      }
    });
  });
};

///////////////// to update a reply or a comment ////////////////////////////////////////////

const updateReply = function (btns) {
  for (const btn of btns) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      let commentDisplayArea = e.target
        .closest(".comment")
        .querySelector(".comment-content");
      let id = findCommentById(btn.dataset.number);

      if (id) {
        html = `
        <form>
          <textarea class="form-control form-update" rows="3">${
            id["replyingTo"] ? "@" + id["replyingTo"] : ""
          } ${id["content"]}</textarea>
     
          <button class="btn btn-primary btn-update">Update</button>
        </form>
`;
        e.target.closest(".btn-action").remove();

        commentDisplayArea.insertAdjacentHTML("afterend", html);
        commentDisplayArea.remove();
        sendUpdateFunction(updateBTN[0], id);
      }
    });
  }
};

//////////////////////////////////// send the updated comment /////////////////////////////////

const sendUpdateFunction = function (btn, comment) {
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    let content = e.target.previousElementSibling.value.split(" ");

    if (content[0] === "@" + comment["replyingTo"]) content.shift();
    content = content.join(" ");
    comment["content"] = content;
    localStorage.setItem("comments", JSON.stringify(comments));

    Display();
  });
};

// ///////////////////////////////////   to delete a comment /////////////////////////////////////////////

const deleteComment = function (btns) {
  for (const btn of btns) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      background.classList.remove("hidden");

      confirmFunction = function (ev) {
        ev.preventDefault();
        let commentToRemove = findCommentById(
          e.target.closest("a").dataset.number
        );
        if (commentToRemove["replyingTo"]) {
          for (const comment of comments) {
            for (let index = 0; index < comment["replies"].length; index++) {
              if (comment["replies"][index] == commentToRemove) {
                comment["replies"].splice(index, 1);
              }
            }
          }
        } else {
          for (let index = 0; index < comments.length; index++) {
            if (comments[index] == commentToRemove) {
              comments.splice(index, 1);
            }
          }
        }
        localStorage.setItem("comments", JSON.stringify(comments));
        background.classList.add("hidden");

        Display();
      };
      confirmDelete.addEventListener("click", (ev) => {
        confirmFunction(ev);
        confirmDelete.removeEventListener("click", confirmDelete);
      });
      cancelDelete.addEventListener("click", (e) => {
        e.preventDefault();
        background.classList.add("hidden");
      });
    });
  }
};

const findCommentById = function (number) {
  let id = 0;
  comments.forEach((comment) => {
    if (comment["id"] === Number(number)) {
      id = comment;
    }
    if (comment["replies"] != [] && id === 0) {
      comment["replies"].forEach((reply) => {
        if (reply["id"] === Number(number)) {
          id = reply;
        }
      });
    }
  });
  return id;
};

const alterScore = function () {
  for (const operator of operators) {
    operator.addEventListener("click", function (e) {
      e.preventDefault();
      id = Number(operator.dataset.id);
      oper = operator.dataset.oper;
      if (oper === "+") findCommentById(id)["score"] += 1;
      else findCommentById(id)["score"] -= 1;
      localStorage.setItem("comments", JSON.stringify(comments));
      Display();
    });
  }
};
const confirmDeleteFunction = function () {
  confirmDelete.addEventListener("click", function (e) {
    e.preventDefault();
  });
};
