const url = "http://localhost:3000"

class InvalidArgumentError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidArgumentError";
  }
}

class NullError extends Error {
  constructor(message) {
    super(message);
    this.name = "NullError";
  }
}

class Model {
  _id
  get id() { return this._id }

  constructor(id) {
    if (!(typeof (id) === 'number'))
      throw InvalidArgumentError("id must be number");
    this._id = id;
  }
}


class Post extends Model {
  #title
  #content
  #author

  get title() {
    return this.#title;
  }
  set title(value) {
    if (!(typeof (value) === 'string'))
      throw new TypeError(`invalid type: ${value}`);
    if (value.length === 0)
      throw new InvalidArgumentError("title must be non empty");
    this.#title = value;
  }

  get content() {
    return this.#content;
  }

  set content(value) {
    if (!(typeof (value) === 'string'))
      throw new TypeError(`invalid type: ${value}`);
    this.#content = value;
  }

  get author() {
    return this.#author;
  }

  set author(value) {
    if (!(value instanceof User))
      throw new InvalidArgumentError("author must be instanse of User");
    this.#author = value;
  }

  constructor(id, title, author, content = "") {
    super(id);
    this.title = title;
    this.content = content;
    this.author = author;
  }
}


class User extends Model {
  #name

  get name() {
    return this.#name;
  }

  set name(value) {
    if (!(typeof (value) === 'string'))
      throw new TypeError(`invalid type: ${value}`);
    if (value.length === 0)
      throw new InvalidArgumentError("name must be non empty");
    this.#name = value;
  }

  constructor(id, name) {
    super(id);
    this.name = name;
  }
}


class PostCardFactory {
  #collbacks

  constructor(collbacks) {
    this.#collbacks = collbacks;
  }

  create_post(post) {
    const card = this.#create_empty_card();
    card.setAttribute('data-postid', post.id.toString());
    const content = this.#post_content_to_text(post.content);
    const title = this.#normolize_title(post.title);
    card.innerHTML = `<div class="col p-4 d-flex flex-column position-static">
      <strong class="d-inline-block mb-2 text-primary-emphasis">${post.author.name}</strong>
      <h3 class="mb-2">${title}</h3>
      <p class="card-text mb-auto">${content}</p>
      <a id="read-post-${post.id}" href="#" class="icon-link icon-link-hover max-content-width">
        Continue reading
        <svg class="bi"><use xlink:href="#chevron-right" /></svg>
      </a>
    </div>
    <div class="col-2 d-flex flex-column justify-content-center align-items-center p-3 bg-secondary">
      <div class="row">
        <div class="col">
          <button id="favorite-post-${post.id}" type="button" class="btn btn-body p-0">
            <i style="font-size: 2rem" class="bi bi-star text-light"></i>
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <button id="update-post-${post.id}" type="button" class="btn btn-body p-0">
            <i style="font-size:2rem" class="bi bi-pencil-square text-light"></i>
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <button id="delete-post-${post.id}" type="button" class="btn btn-body p-0">
            <i style="font-size:2rem" class="bi bi-trash text-light"></i>
          </button>
        </div>
      </div>
    </div>`
    this.#add_event_listeners(card, post);
    return card;
  }

  #create_empty_card() {
    const card = document.createElement('div');
    card.setAttribute('class', 'row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative');
    return card;
  }

  #post_content_to_text(content) {
    const container = document.createElement('div');
    container.innerHTML = content;
    return this.#normalize_content(container.innerText || "");
  }

  #normalize_content(content) {
    return content.substring(0, 150) + "...";
  }

  #normolize_title(title) {
    if (title.length > 50)
      return title.substring(0, 50) + "...";
    return title;
  }

  #add_event_listeners(card, post) {
    card.querySelector(`#favorite-post-${post.id}`)
    .onclick = () => this.#collbacks.favorite_post(post);
    card.querySelector(`#delete-post-${post.id}`)
      .onclick = () => this.#collbacks.delete_post(post);
    card.querySelector(`#update-post-${post.id}`)
      .onclick = () => this.#collbacks.update_post(post);
    card.querySelector(`#read-post-${post.id}`)
      .onclick = () => this.#collbacks.read_post(post);
  }
}

class FavoritePostCardFactory extends PostCardFactory{
  constructor(collbacks) {
    super(collbacks);
  }

  create_post(post) {
    const card = super.create_post(post);
    card.querySelector(`#favorite-post-${post.id}`).innerHTML = 
    '<i style="font-size: 2rem" class="bi bi-star-fill text-light"></i>';
    return card;
  }
}

class Component {
  _bound

  constructor(args = {}) {
    if (args.selector) {
      if (typeof (args.selector) === 'string')
        this.bind(selector);
      else
        throw new TypeError("selector must be string");
    }
  }

  bind(selector) {
    if (!typeof (selector) === 'string')
      throw new TypeError("selector must be string");
    const element = document.querySelector(selector);
    if (element === null)
      throw new NullError("failed to query selector");
    this._bound = element;
    this._bound.innerHTML = "";
  }

  unbind() {
    if (!this._bound)
      return;
    this._bound.innerHTML = "";
    this._bound = null;
  }

  hide() {
    this._bound.hidden = true;
  }

  show() {
    this._bound.hidden = false;
  }
}


class PostCollecion extends Component {
  #factory
  #posts

  get count() {
    return this.#posts.length;
  }

  constructor(args = {}) {
    super(args);

    if (!args.factory)
      throw new NullError("factory of posts is null");
    this.#factory = args.factory;

    if (args.posts) {
      this.#posts = posts;
      this.reload();
    } else {
      this.#posts = new Array();
    }
  }

  bind(selector) {
    super.bind(selector);
    if(!this.count) this.hide();
  }

  add(post) {
    if (!this._bound)
      throw new NullError("bound element is null");
    if (this.#posts.includes(post))
      throw new InvalidArgumentError(`already in collection: ${post}`);
    if (!(post instanceof Post))
      throw new TypeError('post must be instanse of Post');
    const col = document.createElement("div");
    col.setAttribute("class", "col-md-6");
    const card = this.#factory.create_post(post);
    col.appendChild(card);

    let row = null;
    if (this.count % 2 === 0) {
      row = document.createElement("div");
      row.setAttribute("class", "row");
      this._bound.appendChild(row);
    } else {
      row = this._bound.lastElementChild;
    }
    row.appendChild(col);
    this.#posts.push(post);
    this.show();
  }

  update(post) {
    if (this._bound === null)
      throw new NullError("bound element is null");
    if (!this.#posts.map((post) => post.id).includes(post.id))
      throw new InvalidArgumentError(`not in collection: ${post}`);
    let card = this.#get_post_card(post.id);
    const col = card.parentElement;
    col.removeChild(card);
    card = this.#factory.create_post(post);
    col.appendChild(card);
  }

  remove(post) {
    if (this._bound === null)
      throw new NullError("bound element is null");
    if (!this.#posts.includes(post))
      throw new InvalidArgumentError(`not in collection: ${post}`);

    const removeCard = this.#get_post_card(post.id);
    const removeCol = removeCard.parentElement;
    const lastRow = this._bound.lastElementChild;
    const lastCol = lastRow.lastElementChild;
    const lastCard = lastCol.lastElementChild;

    if (!(lastCard.dataset.postid === removeCard.dataset.postid)) {
      removeCol.removeChild(removeCard);
      removeCol.appendChild(lastCard);
    }
    lastRow.removeChild(lastCol);

    if (!lastRow.children.length)
      this._bound.removeChild(lastRow);
    this.#posts = this.#posts.filter((p) => p.id != post.id);
    if(!this.count) this.hide();
  }

  #get_post_card(postid) {
    return this._bound.querySelector(`[data-postid="${postid}"]`);
  }

  reload() {
    this._bound.innerHTML = "";
    for (post in this.#posts)
      this.add(post);
  }
}


class Repository {
  _base

  constructor(base) {
    if (!(typeof (base) === 'string'))
      throw TypeError("url must be string");
    if (base.at(-1) === '/')
      base = base.slice(0, -1);
    this._base = base;
  }

  async all() {
    const url = this._base;
    return fetch(url).then((response) => response.json());
  }

  async get(id) {
    const url = this._base + '/' + id.toString();
    return fetch(url).then((response) => response.json());
  }

  async delete(id) {
    const url = this._base + '/' + id.toString();
    return fetch(url, { method: "DELETE" })
      .then((response) => response.json());
  }

  async update(id, data) {
    const url = this._base + '/' + id.toString();
    return fetch(url, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
    ).then((response) => response.json());
  }

  async create(data) {
    const url = this._base
    return fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
    ).then((response) => response.json());
  }
}


class UserRepository extends Repository {
  constructor(host) {
    super(host + "/users");
  }

  async all() {
    return super.all().then((users) => users.map(this.#make_user));
  }

  async get(id) {
    return super.get(id)
      .then((data) => this.#make_user(data));
  }

  async create(user) {
    if (!(user instanceof User))
      throw new InvalidArgumentError("user must be instanse of User");
    data = { name: user.name }
    return super.create(data);
  }

  #make_user(user) {
    return new User(user.id, user.name);
  }

}


class PostRepository extends Repository {
  #users

  constructor(host, userRepo) {
    super(host + "/posts");
    if (!(userRepo instanceof UserRepository))
      throw new InvalidArgumentError("userRepo must be instanse of UserRepository");
    this.#users = userRepo;
  }

  async all() {
    return super.all()
      .then((posts) => Promise.all(
        posts.map((post) => this.#make_post(post))
      )
      )
  }

  async get(id) {
    return super.get(id)
      .then((post) => this.#make_post(post));
  }

  update(id, post) {
    const data = {}
    if (post.content)
      data.body = post.content;
    if (post.author)
      data.userId = post.author.id;
    if (post.title)
      data.title = post.title;
    return super.update(id, data).then((post) => this.#make_post(post));
  }

  async create(post) {
    if (!(post instanceof Post))
      throw new InvalidArgumentError("post must be instanse of Post");
    return super.create({
      title: post.title,
      body: post.content,
      userId: post.author.id
    }).then((data) => this.#make_post(data));
  }

  async #make_post(post) {
    return this.#users.get(post.userId)
      .then((user) => new Post(post.id, post.title, user, post.body));
  }
}

Data = {}

class postup {
  static init(host) {
    let factory = new FavoritePostCardFactory({
      favorite_post: postup.unfavorite_post,
      update_post: postup.show_modal,
      delete_post: postup.deletePost,
      read_post: postup.read_post,
    })
    Data.favorite = new PostCollecion({factory: factory});
    Data.favorite.bind("#favorite-posts")
    
    factory = new PostCardFactory({
      favorite_post: postup.favorite_post,
      update_post: postup.show_modal,
      delete_post: postup.deletePost,
      read_post: postup.read_post,
    });
    Data.posts = new PostCollecion({ factory: factory });
    Data.posts.bind('#posts');

    Data.userRepo = new UserRepository(host);
    Data.postRepo = new PostRepository(host, Data.userRepo);
    const loader = document.getElementById("loader");
    Data.postRepo.all()
      .then((posts) => {
        let favorite = localStorage.getItem('favorite') || '[]';
        favorite = JSON.parse(favorite);
        for (const post of posts) {
          (favorite.includes(post.id)) ?
            Data.favorite.add(post) : Data.posts.add(post);
        }
        loader.classList.add('visually-hidden');
      });

    document.getElementById("action").onclick = () => postup.show_modal();

    document.getElementById("article").hidden = true;

    document.getElementById("posts-label").onclick = postup.list_cards;
  }

  static show_modal(data) {
    const element = document.getElementById("modal");
    const form = element.querySelector('#post-form');
    form.classList = ['needs-validation'];
    Data.userRepo.all().then((users) => {
      const authors = document.getElementById("author-select");
      authors.innerHTML = "";
      for (const user of users) {
        let option = document.createElement('option')
        option.setAttribute('value', user.id);
        option.innerText = user.name;
        authors.appendChild(option);
      }
      if (data) {
      document.getElementById("modal-label").innerText = "Modify post";
      document.getElementById("title-input").value = data.title;
      document.getElementById("author-select").value = data.author.id.toString();
      tinymce.get("post-editor").setContent(data.content);
      element.querySelector("#submit-post-btn")
        .onclick = () => {
          if (form.checkValidity())
            postup.update_post(data);
          form.classList = ['was-validated'];
        };
    } else {
      document.getElementById("modal-label").innerText = "Create new post";
      document.getElementById("title-input").value = "";
      document.getElementById("author-select").value = "1";
      tinymce.get("post-editor").setContent("");
      element.querySelector("#submit-post-btn")
        .onclick = () => {
          postup.create_post;
        };
    }
    bootstrap.Modal.getOrCreateInstance(element).show();
    })
  }

  static update_post(post) {
    const title = document.getElementById("title-input").value;
    const author = document.getElementById("author-select").value;
    const content = tinymce.get("post-editor").getContent();

    Data.userRepo.get(author)
      .then((user) => Data.postRepo.update(post.id,
        { title: title, author: user, content: content }))
      .then((updPost) => {
        postup.isFavorite(updPost)?
          Data.favorite.update(updPost) : Data.posts.update(updPost);
      });
    const element = document.getElementById("modal");
    const modal = bootstrap.Modal.getOrCreateInstance(element);
    modal.hide();
  }

  static isFavorite(post) {
    let favorite = localStorage.getItem('favorite') || '[]';
    favorite = JSON.parse(favorite);
    return favorite.includes(post.id);
  }

  static create_post() {
    const title = document.getElementById("title-input").value;
    const author = document.getElementById("author-select").value;
    const content = tinymce.get("post-editor").getContent();

    Data.userRepo.get(author)
      .then((user) => Data.postRepo.create(
        new Post(0, title, user, content)))
      .then((newPost) => Data.posts.add(newPost)
      );
    const element = document.getElementById("modal");
    const modal = bootstrap.Modal.getOrCreateInstance(element);
    modal.hide();
  }

  static deletePost(post) {
    if (postup.isFavorite(post)) {
      const element = document.getElementById("favorite-modal");
      const modal = bootstrap.Modal.getOrCreateInstance(element);
      element.querySelector("#delete-favorite").onclick = () => {
          postup._deleteFavoritePost(post);
          modal.hide();
        };
      modal.show();
    } else {
      postup._deletePost(post);
    }
  }
  static _deleteFavoritePost(post) {
    Data.postRepo.delete(post.id);
    Data.favorite.remove(post);
  }

  static _deletePost(post) {
    Data.postRepo.delete(post.id);
    Data.posts.remove(post);
  }

  static read_post(post) {
    document.getElementById("article-title").innerText = post.title;
    document.getElementById("article-author").innerText = post.author.name;
    document.getElementById("article-content").innerHTML = post.content;
    Data.favorite.hide();
    Data.posts.hide();
    document.getElementById("article").hidden = false;
    const btn = document.getElementById("action")
    btn.onclick = () => postup.list_cards();
    btn.innerText = "Back";
  }

  static list_cards() {
    if(Data.favorite.count)
      Data.favorite.show();
    if(Data.posts.count)
      Data.posts.show();
    document.getElementById("article").hidden = true;
    const btn = document.getElementById("action")
    btn.onclick = () => postup.show_modal();
    btn.innerText = "Add";
  }

  static favorite_post(post) {
    let favorite = localStorage.getItem("favorite") || "[]";
    favorite = JSON.parse(favorite);
    if(!favorite.includes(post.id)) {
      favorite.push(post.id);
      localStorage.setItem('favorite', JSON.stringify(favorite));
    }
    Data.posts.remove(post);
    Data.favorite.add(post);
  }

  static unfavorite_post(post) {
    let favorite = localStorage.getItem("favorite") || "[]";
    favorite = JSON.parse(favorite);
    if(favorite.includes(post.id)) {
      favorite = favorite.filter((i) => i != post.id);
      localStorage.setItem('favorite', JSON.stringify(favorite));
    }
    Data.favorite.remove(post);
    Data.posts.add(post);
  }
}

postup.init(url);